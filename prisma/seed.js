"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@vehicletracker.com' },
        update: {},
        create: {
            email: 'admin@vehicletracker.com',
            password: hashedPassword,
            name: 'Admin User',
            role: client_1.Role.ADMIN,
        },
    });
    const userPassword = await bcryptjs_1.default.hash('user123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@vehicletracker.com' },
        update: {},
        create: {
            email: 'user@vehicletracker.com',
            password: userPassword,
            name: 'Regular User',
            role: client_1.Role.USER,
        },
    });
    const vehicles = [
        {
            plateNumber: 'B1234ABC',
            model: 'Avanza',
            brand: 'Toyota',
            year: 2020,
            status: client_1.VehicleStatus.ACTIVE,
        },
        {
            plateNumber: 'B5678DEF',
            model: 'Innova',
            brand: 'Toyota',
            year: 2021,
            status: client_1.VehicleStatus.ACTIVE,
        },
        {
            plateNumber: 'B9012GHI',
            model: 'Ertiga',
            brand: 'Suzuki',
            year: 2019,
            status: client_1.VehicleStatus.ACTIVE,
        },
        {
            plateNumber: 'B3456JKL',
            model: 'Xenia',
            brand: 'Daihatsu',
            year: 2022,
            status: client_1.VehicleStatus.MAINTENANCE,
        },
        {
            plateNumber: 'B7890MNO',
            model: 'Grand Livina',
            brand: 'Nissan',
            year: 2020,
            status: client_1.VehicleStatus.INACTIVE,
        },
    ];
    for (const vehicleData of vehicles) {
        await prisma.vehicle.upsert({
            where: { plateNumber: vehicleData.plateNumber },
            update: {},
            create: vehicleData,
        });
    }
    const allVehicles = await prisma.vehicle.findMany();
    const now = new Date();
    const statusTypes = [client_1.StatusType.TRIP, client_1.StatusType.IDLE, client_1.StatusType.STOPPED];
    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        for (const vehicle of allVehicles) {
            const recordCount = Math.floor(Math.random() * 3) + 3;
            for (let j = 0; j < recordCount; j++) {
                const timestamp = new Date(date);
                timestamp.setHours(Math.floor(Math.random() * 24));
                timestamp.setMinutes(Math.floor(Math.random() * 60));
                const status = statusTypes[Math.floor(Math.random() * statusTypes.length)];
                const latitude = -6.2 + (Math.random() - 0.5) * 0.1;
                const longitude = 106.8 + (Math.random() - 0.5) * 0.1;
                const speed = status === client_1.StatusType.TRIP ? Math.floor(Math.random() * 80) + 20 : 0;
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
//# sourceMappingURL=seed.js.map