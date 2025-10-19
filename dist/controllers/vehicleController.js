"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getVehicleStatus = exports.getVehicleById = exports.getVehicles = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const getVehiclesSchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('10'),
    sortBy: zod_1.z.enum(['date', 'plateNumber', 'status']).optional().default('date'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
const getVehicleStatusSchema = zod_1.z.object({
    date: zod_1.z.string().optional(),
});
const getVehicles = async (req, res) => {
    try {
        const { page, limit, sortBy, sortOrder } = getVehiclesSchema.parse(req.query);
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        let orderBy = {};
        if (sortBy === 'date') {
            orderBy = { createdAt: sortOrder };
        }
        else if (sortBy === 'plateNumber') {
            orderBy = { plateNumber: sortOrder };
        }
        else if (sortBy === 'status') {
            orderBy = { status: sortOrder };
        }
        const [vehicles, totalCount] = await Promise.all([
            prisma.vehicle.findMany({
                skip,
                take: limitNum,
                orderBy,
                include: {
                    vehicleStatuses: {
                        orderBy: { timestamp: 'desc' },
                        take: 1,
                    },
                },
            }),
            prisma.vehicle.count(),
        ]);
        const vehiclesWithLocation = vehicles.map(vehicle => ({
            ...vehicle,
            location: vehicle.vehicleStatuses[0]
                ? `${vehicle.vehicleStatuses[0].latitude?.toFixed(4)}, ${vehicle.vehicleStatuses[0].longitude?.toFixed(4)}`
                : 'Unknown',
        }));
        const totalPages = Math.ceil(totalCount / limitNum);
        res.json({
            success: true,
            data: {
                vehicles: vehiclesWithLocation,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                },
            },
        });
    }
    catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getVehicles = getVehicles;
const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: {
                vehicleStatuses: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
            },
        });
        if (!vehicle) {
            res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
            return;
        }
        const vehicleWithLocation = {
            ...vehicle,
            location: vehicle.vehicleStatuses[0]
                ? `${vehicle.vehicleStatuses[0].latitude?.toFixed(4)}, ${vehicle.vehicleStatuses[0].longitude?.toFixed(4)}`
                : 'Unknown',
        };
        res.json({
            success: true,
            data: vehicleWithLocation,
        });
    }
    catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getVehicleById = getVehicleById;
const getVehicleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = getVehicleStatusSchema.parse(req.query);
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
        });
        if (!vehicle) {
            res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
            return;
        }
        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        const statusRecords = await prisma.vehicleStatusRecord.findMany({
            where: {
                vehicleId: id,
                timestamp: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: { timestamp: 'asc' },
        });
        const statusRecordsWithLocation = statusRecords.map(record => ({
            ...record,
            location: record.latitude && record.longitude
                ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`
                : 'Unknown',
        }));
        res.json({
            success: true,
            data: {
                vehicle: {
                    id: vehicle.id,
                    plateNumber: vehicle.plateNumber,
                    model: vehicle.model,
                    brand: vehicle.brand,
                    year: vehicle.year,
                    status: vehicle.status,
                },
                statusRecords: statusRecordsWithLocation,
                date: targetDate.toISOString().split('T')[0],
            },
        });
    }
    catch (error) {
        console.error('Error fetching vehicle status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getVehicleStatus = getVehicleStatus;
const createVehicle = async (req, res) => {
    try {
        const { plateNumber, model, brand, year, status = 'ACTIVE' } = req.body;
        if (!plateNumber || !model || !brand || !year) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: plateNumber, model, brand, year',
            });
            return;
        }
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { plateNumber },
        });
        if (existingVehicle) {
            res.status(400).json({
                success: false,
                message: 'Vehicle with this plate number already exists',
            });
            return;
        }
        const vehicle = await prisma.vehicle.create({
            data: {
                plateNumber,
                model,
                brand,
                year: parseInt(year),
                status,
            },
        });
        res.status(201).json({
            success: true,
            data: vehicle,
            message: 'Vehicle created successfully',
        });
    }
    catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.createVehicle = createVehicle;
const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { id },
        });
        if (!existingVehicle) {
            res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
            return;
        }
        if (updateData.plateNumber && updateData.plateNumber !== existingVehicle.plateNumber) {
            const duplicateVehicle = await prisma.vehicle.findUnique({
                where: { plateNumber: updateData.plateNumber },
            });
            if (duplicateVehicle) {
                res.status(400).json({
                    success: false,
                    message: 'Vehicle with this plate number already exists',
                });
                return;
            }
        }
        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: updateData,
        });
        res.json({
            success: true,
            data: vehicle,
            message: 'Vehicle updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { id },
        });
        if (!existingVehicle) {
            res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
            return;
        }
        await prisma.vehicle.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'Vehicle deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.deleteVehicle = deleteVehicle;
//# sourceMappingURL=vehicleController.js.map