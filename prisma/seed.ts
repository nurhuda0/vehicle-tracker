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
      model: 'Hiace',
      brand: 'Toyota',
      year: 2019,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B3456JKL',
      model: 'Fortuner',
      brand: 'Toyota',
      year: 2022,
      status: VehicleStatus.MAINTENANCE,
    },
    
    // Suzuki Fleet
    {
      plateNumber: 'B7890MNO',
      model: 'Ertiga',
      brand: 'Suzuki',
      year: 2020,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B2468PQR',
      model: 'APV',
      brand: 'Suzuki',
      year: 2018,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B1357STU',
      model: 'Carry',
      brand: 'Suzuki',
      year: 2021,
      status: VehicleStatus.INACTIVE,
    },
    
    
    {
      plateNumber: 'B9753VWX',
      model: 'Xenia',
      brand: 'Daihatsu',
      year: 2019,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B8642YZA',
      model: 'Terios',
      brand: 'Daihatsu',
      year: 2020,
      status: VehicleStatus.MAINTENANCE,
    },
    
    
    {
      plateNumber: 'B7531BCD',
      model: 'Grand Livina',
      brand: 'Nissan',
      year: 2018,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B6420EFG',
      model: 'Navara',
      brand: 'Nissan',
      year: 2022,
      status: VehicleStatus.ACTIVE,
    },
    
    // Honda Fleet
    {
      plateNumber: 'B5319HIJ',
      model: 'Mobilio',
      brand: 'Honda',
      year: 2021,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B4208KLM',
      model: 'BR-V',
      brand: 'Honda',
      year: 2019,
      status: VehicleStatus.INACTIVE,
    },
    
    // Mitsubishi Fleet
    {
      plateNumber: 'B3197NOP',
      model: 'Xpander',
      brand: 'Mitsubishi',
      year: 2020,
      status: VehicleStatus.ACTIVE,
    },
    {
      plateNumber: 'B2086QRS',
      model: 'L300',
      brand: 'Mitsubishi',
      year: 2017,
      status: VehicleStatus.MAINTENANCE,
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

  // Create vehicle status records for the last 30 days with more realistic patterns
  const now = new Date();
  const statusTypes = [StatusType.TRIP, StatusType.IDLE, StatusType.STOPPED];
  
  // Jakarta area coordinates for realistic locations
  const jakartaLocations = [
    { name: 'Central Jakarta', lat: -6.2088, lng: 106.8456 },
    { name: 'South Jakarta', lat: -6.2615, lng: 106.8106 },
    { name: 'North Jakarta', lat: -6.1352, lng: 106.8133 },
    { name: 'East Jakarta', lat: -6.2250, lng: 106.9004 },
    { name: 'West Jakarta', lat: -6.1352, lng: 106.8133 },
    { name: 'Bekasi', lat: -6.2383, lng: 106.9756 },
    { name: 'Depok', lat: -6.4025, lng: 106.7942 },
    { name: 'Tangerang', lat: -6.1781, lng: 106.6300 },
  ];

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    for (const vehicle of allVehicles) {
      // Skip some days randomly (weekends, maintenance days)
      if (Math.random() < 0.1) continue;
      
      // Create 4-8 status records per day per vehicle
      const recordCount = Math.floor(Math.random() * 5) + 4;
      let currentLocation = jakartaLocations[Math.floor(Math.random() * jakartaLocations.length)];

      for (let j = 0; j < recordCount; j++) {
        const timestamp = new Date(date);
        
        // More realistic time distribution (business hours)
        if (j < 2) {
          // Morning records (6-9 AM)
          timestamp.setHours(6 + Math.floor(Math.random() * 3));
          timestamp.setMinutes(Math.floor(Math.random() * 60));
        } else if (j < 4) {
          // Afternoon records (12-2 PM)
          timestamp.setHours(12 + Math.floor(Math.random() * 2));
          timestamp.setMinutes(Math.floor(Math.random() * 60));
        } else if (j < 6) {
          // Evening records (4-7 PM)
          timestamp.setHours(16 + Math.floor(Math.random() * 3));
          timestamp.setMinutes(Math.floor(Math.random() * 60));
        } else {
          // Night records (8-11 PM)
          timestamp.setHours(20 + Math.floor(Math.random() * 3));
          timestamp.setMinutes(Math.floor(Math.random() * 60));
        }

        // Determine status based on realistic patterns
        let status: StatusType;
        if (j === 0 || j === recordCount - 1) {
          // First and last records are usually STOPPED
          status = StatusType.STOPPED;
        } else if (Math.random() < 0.3) {
          // 30% chance of being IDLE
          status = StatusType.IDLE;
        } else {
          // 70% chance of being TRIP
          status = StatusType.TRIP;
        }

        // Add some location variation for trips
        if (status === StatusType.TRIP && Math.random() < 0.3) {
          currentLocation = jakartaLocations[Math.floor(Math.random() * jakartaLocations.length)];
        }

        const latitude = currentLocation.lat + (Math.random() - 0.5) * 0.01;
        const longitude = currentLocation.lng + (Math.random() - 0.5) * 0.01;
        const speed = status === StatusType.TRIP ? Math.floor(Math.random() * 60) + 20 : 0;

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
  console.log(`📊 Created vehicle status records for the last 30 days`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
