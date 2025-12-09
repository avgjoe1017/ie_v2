import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const adminPinHash = await bcrypt.hash('123456', 10);
  const producerPinHash = await bcrypt.hash('111111', 10);

  // Create admin user
  try {
    await prisma.user.delete({ where: { id: 'admin-user-id' } });
  } catch { /* ignore */ }
  
  const admin = await prisma.user.create({
    data: {
      id: 'admin-user-id',
      name: 'Admin',
      pinHash: adminPinHash,
      role: 'admin',
    },
  });

  // Create producer user
  try {
    await prisma.user.delete({ where: { id: 'producer-user-id' } });
  } catch { /* ignore */ }
  
  const producer = await prisma.user.create({
    data: {
      id: 'producer-user-id',
      name: 'Producer',
      pinHash: producerPinHash,
      role: 'producer',
    },
  });

  console.log('✅ Created users:', { admin: admin.name, producer: producer.name });

  // Clear existing stations
  await prisma.phoneNumber.deleteMany({});
  await prisma.station.deleteMany({});

  // Create sample stations for testing
  const sampleStations = [
    {
      marketNumber: 1,
      marketName: 'NEW YORK',
      callLetters: 'WCBS-TV',
      feed: '6pm',
      broadcastStatus: 'live',
      airTimeLocal: '5:00 PM',
      airTimeET: '5:00 PM',
      phones: [
        { label: 'Control Room', number: '+12125551234', sortOrder: 1 },
        { label: 'News Desk', number: '+12125555678', sortOrder: 2 },
      ],
    },
    {
      marketNumber: 2,
      marketName: 'LOS ANGELES',
      callLetters: 'KCBS-TV',
      feed: '6pm',
      broadcastStatus: 'rerack',
      airTimeLocal: '5:00 PM',
      airTimeET: '8:00 PM',
      phones: [
        { label: 'Operations', number: '+13105551234', sortOrder: 1 },
      ],
    },
    {
      marketNumber: 3,
      marketName: 'CHICAGO, IL',
      callLetters: 'WLS-TV',
      feed: '3pm',
      broadcastStatus: 'rerack',
      airTimeLocal: '3:00 PM',
      airTimeET: '4:00 PM',
      phones: [
        { label: 'Joshua Baranoff', number: '+16784597853', sortOrder: 1 },
        { label: 'Operations', number: '+12816025611', sortOrder: 2 },
      ],
    },
    {
      marketNumber: 3,
      marketName: 'CHICAGO, IL',
      callLetters: 'WLS-TV',
      feed: '6pm',
      broadcastStatus: 'live',
      airTimeLocal: '3:37 AM',
      airTimeET: '4:37 AM',
      phones: [
        { label: 'Atlanta Hub', number: '+16784216902', sortOrder: 1 },
      ],
    },
    {
      marketNumber: 4,
      marketName: 'PHILADELPHIA, PA',
      callLetters: 'KYW-TV',
      feed: '5pm',
      broadcastStatus: 'might',
      airTimeLocal: '5:00 PM',
      airTimeET: '5:00 PM',
      phones: [
        { label: 'Master Control', number: '+12155551234', sortOrder: 1 },
      ],
    },
    {
      marketNumber: 5,
      marketName: 'DALLAS-FT. WORTH',
      callLetters: 'KTVT',
      feed: '5pm',
      broadcastStatus: null,
      airTimeLocal: '4:00 PM',
      airTimeET: '5:00 PM',
      phones: [
        { label: 'News Desk', number: '+12145551234', sortOrder: 1 },
        { label: 'Assignment', number: '+12145555678', sortOrder: 2 },
        { label: 'Backup', number: '+12145559999', sortOrder: 3 },
      ],
    },
  ];

  for (const stationData of sampleStations) {
    const { phones, ...stationFields } = stationData;
    
    const station = await prisma.station.create({
      data: {
        ...stationFields,
        phones: {
          create: phones,
        },
      },
    });

    console.log(`✅ Created station: ${station.callLetters} (${station.feed})`);
  }

  console.log('');
  console.log('🎉 Seeding complete!');
  console.log('');
  console.log('Default users:');
  console.log('  Admin PIN: 123456');
  console.log('  Producer PIN: 111111');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
