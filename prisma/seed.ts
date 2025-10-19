import { PrismaClient, Role, VehicleStatus, StatusType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vehicletracker.com' },
    update: {},
    create: {
      email: 'admin@vehicletracker.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@vehicletracker.com' },
    update: {},
    create: {
      email: 'user@vehicletracker.com',
      password: userPassword,
      name: 'Regular User',
      role: Role.USER,
    },
  });

  // Create vehicles
  const vehicles = [
    {
      plateNumber: 'B1234ABC',
      model: 'Avanza',
      brand: 'Toyota',
      year: 2020,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B5678DEF',
      model: 'Innova',
      brand: 'Toyota',
      year: 2021,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B9012GHI',
      model: 'Ertiga',
      brand: 'Suzuki',
      year: 2019,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B3456JKL',
      model: 'Xenia',
      brand: 'Daihatsu',
      year: 2022,
      status: VehicleStatus.MAINTENANCE,
    },
    {
      plateNumber: 'B7890MNO',
      model: 'Grand Livina',
      brand: 'Nissan',
      year: 2020,
      status: VehicleStatus.INACTIVE,
    },
  ];

  for (const vehicleData of vehicles) {
    await prisma.vehicle.upsert({
      where: { plateNumber: vehicleData.plateNumber },
      update: {},
      create: vehicleData,
    });
  }

  // Get all vehicles for status records
  const allVehicles = await prisma.vehicle.findMany();

  // Create vehicle status records for the last 7 days
  const now = new Date();
  const statusTypes = [StatusType.TRIP, StatusType.IDLE, StatusType.STOPPED];

  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    for (const vehicle of allVehicles) {
      // Create 3-5 status records per day per vehicle
      const recordCount = Math.floor(Math.random() * 3) + 3;

      for (let j = 0; j < recordCount; j++) {
        const timestamp = new Date(date);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));

        const status = statusTypes[Math.floor(Math.random() * statusTypes.length)];
        const latitude = -6.2 + (Math.random() - 0.5) * 0.1; // Jakarta area
        const longitude = 106.8 + (Math.random() - 0.5) * 0.1;
        const speed = status === StatusType.TRIP ? Math.floor(Math.random() * 80) + 20 : 0;

        await prisma.vehicleStatusRecord.create({
          data: {
            vehicleId: vehicle.id,
            status,
            latitude,
            longitude,
            speed,
            timestamp,
          },
        });
      }
    }
  }

  console.log('✅ Database seeding completed!');
  console.log(`👤 Created users: ${admin.email}, ${user.email}`);
  console.log(`🚗 Created ${vehicles.length} vehicles`);
  console.log(`📊 Created vehicle status records for the last 7 days`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
