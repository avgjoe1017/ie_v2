import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
}

function normalizeFeed(feedStr: string): '3pm' | '5pm' | '6pm' {
  const cleaned = feedStr.toLowerCase().trim();
  if (cleaned.includes('3')) return '3pm';
  if (cleaned.includes('5')) return '5pm';
  return '6pm';
}

function normalizeStatus(statusStr: string): 'live' | 'rerack' | 'might' | null {
  if (!statusStr || statusStr.trim() === '') return null;
  const cleaned = statusStr.toLowerCase().trim();
  if (cleaned === 'live') return 'live';
  if (cleaned === 'rerack') return 'rerack';
  if (cleaned === 'might') return 'might';
  return null;
}

function cleanPhone(phone: string): string | null {
  if (!phone || phone.trim() === '') return null;
  
  // Remove common formatting
  let cleaned = phone.replace(/[^\d\sx]/gi, '');
  
  // Extract just digits
  const digits = cleaned.replace(/\D/g, '');
  
  // Need at least 7 digits for a valid phone (local numbers)
  if (digits.length < 7) return null;
  
  // If 10+ digits, format as US number
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+1${last10}`;
  }
  
  // For 7-digit local numbers, assume they need area code - skip them
  return null;
}

async function main() {
  console.log('📥 Importing station data from CSV...\n');

  // Read CSV file
  const csvPath = path.join(process.cwd(), '..', 'ie data as of 12-6.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');

  // Parse header to understand column positions
  const header = parseCSVLine(lines[0]);
  console.log('CSV Columns:', header.join(' | '));
  console.log('');

  // Skip header
  const dataLines = lines.slice(1);

  console.log(`Found ${dataLines.length} rows to import\n`);

  // Clear existing data
  console.log('Clearing existing station data...');
  await prisma.callLog.deleteMany({});
  await prisma.editLog.deleteMany({});
  await prisma.phoneNumber.deleteMany({});
  await prisma.station.deleteMany({});
  console.log('✓ Cleared existing data\n');

  let imported = 0;
  let errors: string[] = [];
  let phonesImported = 0;

  for (const line of dataLines) {
    const values = parseCSVLine(line);
    
    // CSV format: Feed, Status(empty), Rank, Station, City, Air Time, ET Time, Main Name, Main Phone, #2 Name, Phone #2, #3 Name, Phone #3, #4 Name, Phone #4
    // Index:        0       1          2      3        4       5         6         7           8         9         10        11        12       13        14
    
    const feed = values[0] || '';
    const status = values[1] || '';
    const rank = values[2] || '';
    const station = values[3] || '';
    const city = values[4] || '';
    const airTime = values[5] || '';
    const etTime = values[6] || '';
    const mainName = values[7] || '';
    const mainPhone = values[8] || '';
    const name2 = values[9] || '';
    const phone2 = values[10] || '';
    const name3 = values[11] || '';
    const phone3 = values[12] || '';
    const name4 = values[13] || '';
    const phone4 = values[14] || '';

    const marketNumber = parseInt(rank, 10);
    if (isNaN(marketNumber) || !station) {
      errors.push(`Invalid row: ${line.substring(0, 50)}...`);
      continue;
    }

    const feedNormalized = normalizeFeed(feed);
    const statusNormalized = normalizeStatus(status);

    // Build phone list - be more lenient with phone parsing
    const phones: { label: string; number: string; sortOrder: number }[] = [];
    
    // Debug: log the phone values
    // console.log(`  Phones for ${station}: "${mainPhone}" "${phone2}" "${phone3}" "${phone4}"`);
    
    if (mainName || mainPhone) {
      const phoneClean = cleanPhone(mainPhone);
      if (phoneClean) {
        phones.push({ label: mainName || 'Main', number: phoneClean, sortOrder: 1 });
      }
    }
    
    if (name2 || phone2) {
      const phoneClean = cleanPhone(phone2);
      if (phoneClean) {
        phones.push({ label: name2 || 'Alternate', number: phoneClean, sortOrder: 2 });
      }
    }
    
    if (name3 || phone3) {
      const phoneClean = cleanPhone(phone3);
      if (phoneClean) {
        phones.push({ label: name3 || 'Backup', number: phoneClean, sortOrder: 3 });
      }
    }
    
    if (name4 || phone4) {
      const phoneClean = cleanPhone(phone4);
      if (phoneClean) {
        phones.push({ label: name4 || 'Other', number: phoneClean, sortOrder: 4 });
      }
    }

    // If no phones found, try harder to find any phone-like data in all columns
    if (phones.length === 0) {
      // Look for any phone pattern in the remaining columns
      for (let i = 7; i < values.length; i++) {
        const val = values[i];
        if (val && /\d{3}.*\d{3}.*\d{4}/.test(val)) {
          const phoneClean = cleanPhone(val);
          if (phoneClean) {
            const label = values[i - 1] || values[i + 1] || 'Contact';
            phones.push({ label: label.replace(/[^a-zA-Z\s]/g, '').trim() || 'Contact', number: phoneClean, sortOrder: phones.length + 1 });
          }
        }
      }
    }

    if (phones.length === 0) {
      errors.push(`No valid phones for ${station} (${city}) - raw: ${mainPhone || 'empty'}`);
      continue;
    }

    try {
      // Check if already exists (same market + feed)
      const existing = await prisma.station.findUnique({
        where: {
          marketNumber_feed: {
            marketNumber,
            feed: feedNormalized,
          },
        },
      });

      if (existing) {
        // Update existing
        await prisma.phoneNumber.deleteMany({
          where: { stationId: existing.id },
        });

        await prisma.station.update({
          where: { id: existing.id },
          data: {
            marketName: city,
            callLetters: station,
            broadcastStatus: statusNormalized,
            airTimeLocal: airTime,
            airTimeET: etTime,
            phones: {
              create: phones,
            },
          },
        });
      } else {
        // Create new
        await prisma.station.create({
          data: {
            marketNumber,
            marketName: city,
            callLetters: station,
            feed: feedNormalized,
            broadcastStatus: statusNormalized,
            airTimeLocal: airTime,
            airTimeET: etTime,
            phones: {
              create: phones,
            },
          },
        });
      }

      phonesImported += phones.length;
      imported++;
      const statusBadge = statusNormalized ? ` [${statusNormalized.toUpperCase()}]` : '';
      console.log(`✓ ${station} (${city}) - ${feedNormalized.toUpperCase()}${statusBadge} (${phones.length} phones)`);
    } catch (err) {
      errors.push(`Error importing ${station}: ${err}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported} stations with ${phonesImported} phone numbers`);
  
  if (errors.length > 0) {
    console.log(`   Skipped: ${errors.length} rows`);
    console.log('\nSkipped rows (first 20):');
    errors.slice(0, 20).forEach(e => console.log(`   ⚠️ ${e}`));
    if (errors.length > 20) {
      console.log(`   ... and ${errors.length - 20} more`);
    }
  }

  // Show summary by feed
  const byFeed = await prisma.station.groupBy({
    by: ['feed'],
    _count: true,
  });
  
  console.log('\n📊 Database Summary:');
  console.log(`   Total stations: ${await prisma.station.count()}`);
  console.log(`   Total phone numbers: ${await prisma.phoneNumber.count()}`);
  console.log('\n   By Feed:');
  for (const f of byFeed) {
    console.log(`     ${f.feed.toUpperCase()}: ${f._count} stations`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
