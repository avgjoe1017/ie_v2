import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { normalizeFeed, normalizeStatus } from '@/domain/market';
import { parseCSVPhone } from '@/domain/phone';

interface CSVRow {
  Feed: string;
  Status: string;
  Rank: string;
  Station: string;
  City: string;
  'Air Time': string;
  'ET Time': string;
  'Main Name': string;
  'Main Phone': string;
  '#2 Name': string;
  'Phone #2': string;
  '#3 Name': string;
  'Phone #3': string;
  '#4 Name': string;
  'Phone #4': string;
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    
    rows.push(row as unknown as CSVRow);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  
  return values;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data in CSV' }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let errors: string[] = [];

    for (const row of rows) {
      try {
        const feed = normalizeFeed(row.Feed);
        const marketNumber = parseInt(row.Rank, 10);
        
        if (isNaN(marketNumber)) {
          errors.push(`Invalid market number: ${row.Rank}`);
          continue;
        }

        // Prepare phones
        const phones: { label: string; number: string; sortOrder: number }[] = [];
        
        if (row['Main Name'] && row['Main Phone']) {
          const number = parseCSVPhone(row['Main Phone']);
          if (number) {
            phones.push({ label: row['Main Name'], number, sortOrder: 1 });
          }
        }
        
        if (row['#2 Name'] && row['Phone #2']) {
          const number = parseCSVPhone(row['Phone #2']);
          if (number) {
            phones.push({ label: row['#2 Name'], number, sortOrder: 2 });
          }
        }
        
        if (row['#3 Name'] && row['Phone #3']) {
          const number = parseCSVPhone(row['Phone #3']);
          if (number) {
            phones.push({ label: row['#3 Name'], number, sortOrder: 3 });
          }
        }
        
        if (row['#4 Name'] && row['Phone #4']) {
          const number = parseCSVPhone(row['Phone #4']);
          if (number) {
            phones.push({ label: row['#4 Name'], number, sortOrder: 4 });
          }
        }

        // Check if station exists
        const existing = await prisma.station.findUnique({
          where: {
            marketNumber_feed: {
              marketNumber,
              feed,
            },
          },
        });

        if (existing) {
          // Update existing station
          await prisma.station.update({
            where: { id: existing.id },
            data: {
              marketName: row.City,
              callLetters: row.Station,
              broadcastStatus: normalizeStatus(row.Status),
              airTimeLocal: row['Air Time'],
              airTimeET: row['ET Time'],
            },
          });

          // Delete existing phones and recreate
          await prisma.phoneNumber.deleteMany({
            where: { stationId: existing.id },
          });

          if (phones.length > 0) {
            await prisma.phoneNumber.createMany({
              data: phones.map((p) => ({
                ...p,
                stationId: existing.id,
              })),
            });
          }

          updated++;
        } else {
          // Create new station
          await prisma.station.create({
            data: {
              marketNumber,
              marketName: row.City,
              callLetters: row.Station,
              feed,
              broadcastStatus: normalizeStatus(row.Status),
              airTimeLocal: row['Air Time'],
              airTimeET: row['ET Time'],
              phones: {
                create: phones,
              },
            },
          });

          created++;
        }
      } catch (err) {
        errors.push(`Row error: ${row.Station} - ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      errors: errors.slice(0, 10), // Limit errors returned
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}

