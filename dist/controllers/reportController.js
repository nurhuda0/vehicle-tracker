"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGeneralReport = exports.generateVehicleReport = void 0;
const client_1 = require("@prisma/client");
const XLSX = __importStar(require("xlsx"));
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const generateReportSchema = zod_1.z.object({
    vehicleId: zod_1.z.string().optional(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
});
const generateVehicleReport = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { startDate, endDate } = generateReportSchema.parse(req.query);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (start > end) {
            res.status(400).json({
                success: false,
                message: 'Start date must be before end date',
            });
            return;
        }
        let vehicles = [];
        let statusRecords = [];
        if (vehicleId === 'all') {
            vehicles = await prisma.vehicle.findMany({
                orderBy: { plateNumber: 'asc' },
            });
            statusRecords = await prisma.vehicleStatusRecord.findMany({
                where: {
                    timestamp: {
                        gte: start,
                        lte: end,
                    },
                },
                include: {
                    vehicle: {
                        select: {
                            plateNumber: true,
                            model: true,
                            brand: true,
                        },
                    },
                },
                orderBy: [
                    { vehicle: { plateNumber: 'asc' } },
                    { timestamp: 'asc' },
                ],
            });
        }
        else {
            const vehicle = await prisma.vehicle.findUnique({
                where: { id: vehicleId },
            });
            if (!vehicle) {
                res.status(404).json({
                    success: false,
                    message: 'Vehicle not found',
                });
                return;
            }
            vehicles = [vehicle];
            statusRecords = await prisma.vehicleStatusRecord.findMany({
                where: {
                    vehicleId,
                    timestamp: {
                        gte: start,
                        lte: end,
                    },
                },
                include: {
                    vehicle: {
                        select: {
                            plateNumber: true,
                            model: true,
                            brand: true,
                        },
                    },
                },
                orderBy: { timestamp: 'asc' },
            });
        }
        const workbook = XLSX.utils.book_new();
        const summaryData = vehicles.map(vehicle => {
            const vehicleRecords = statusRecords.filter(record => record.vehicleId === vehicle.id);
            const tripCount = vehicleRecords.filter(record => record.status === 'TRIP').length;
            const idleCount = vehicleRecords.filter(record => record.status === 'IDLE').length;
            const stoppedCount = vehicleRecords.filter(record => record.status === 'STOPPED').length;
            return {
                'Plate Number': vehicle.plateNumber,
                'Brand': vehicle.brand,
                'Model': vehicle.model,
                'Year': vehicle.year,
                'Status': vehicle.status,
                'Total Records': vehicleRecords.length,
                'Trip Records': tripCount,
                'Idle Records': idleCount,
                'Stopped Records': stoppedCount,
            };
        });
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        const detailedData = statusRecords.map(record => ({
            'Plate Number': record.vehicle.plateNumber,
            'Brand': record.vehicle.brand,
            'Model': record.vehicle.model,
            'Status': record.status,
            'Date': new Date(record.timestamp).toLocaleDateString('id-ID'),
            'Time': new Date(record.timestamp).toLocaleTimeString('id-ID'),
            'Latitude': record.latitude || '',
            'Longitude': record.longitude || '',
            'Speed (km/h)': record.speed || 0,
            'Location': record.latitude && record.longitude
                ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`
                : 'Unknown',
        }));
        const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
        XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Records');
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        const filename = vehicleId === 'all'
            ? `vehicle-report-all-${startDate}-to-${endDate}.xlsx`
            : `vehicle-report-${vehicles[0]?.plateNumber}-${startDate}-to-${endDate}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.generateVehicleReport = generateVehicleReport;
const generateGeneralReport = async (req, res) => {
    try {
        const { startDate, endDate } = generateReportSchema.parse(req.query);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (start > end) {
            res.status(400).json({
                success: false,
                message: 'Start date must be before end date',
            });
            return;
        }
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { plateNumber: 'asc' },
        });
        const statusRecords = await prisma.vehicleStatusRecord.findMany({
            where: {
                timestamp: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                vehicle: {
                    select: {
                        plateNumber: true,
                        model: true,
                        brand: true,
                    },
                },
            },
            orderBy: [
                { vehicle: { plateNumber: 'asc' } },
                { timestamp: 'asc' },
            ],
        });
        const workbook = XLSX.utils.book_new();
        const summaryData = vehicles.map(vehicle => {
            const vehicleRecords = statusRecords.filter(record => record.vehicleId === vehicle.id);
            const tripCount = vehicleRecords.filter(record => record.status === 'TRIP').length;
            const idleCount = vehicleRecords.filter(record => record.status === 'IDLE').length;
            const stoppedCount = vehicleRecords.filter(record => record.status === 'STOPPED').length;
            return {
                'Plate Number': vehicle.plateNumber,
                'Brand': vehicle.brand,
                'Model': vehicle.model,
                'Year': vehicle.year,
                'Status': vehicle.status,
                'Total Records': vehicleRecords.length,
                'Trip Records': tripCount,
                'Idle Records': idleCount,
                'Stopped Records': stoppedCount,
            };
        });
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        const detailedData = statusRecords.map(record => ({
            'Plate Number': record.vehicle.plateNumber,
            'Brand': record.vehicle.brand,
            'Model': record.vehicle.model,
            'Status': record.status,
            'Date': new Date(record.timestamp).toLocaleDateString('id-ID'),
            'Time': new Date(record.timestamp).toLocaleTimeString('id-ID'),
            'Latitude': record.latitude || '',
            'Longitude': record.longitude || '',
            'Speed (km/h)': record.speed || 0,
            'Location': record.latitude && record.longitude
                ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`
                : 'Unknown',
        }));
        const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
        XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Records');
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        const filename = `vehicle-report-${startDate}-to-${endDate}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        res.send(excelBuffer);
    }
    catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.generateGeneralReport = generateGeneralReport;
//# sourceMappingURL=reportController.js.map