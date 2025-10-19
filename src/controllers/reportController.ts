import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const generateReportSchema = z.object({
  vehicleId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
});

/**
 * @swagger
 * /api/reports/vehicle/{vehicleId}:
 *   get:
 *     summary: Generate Excel report for vehicle status records
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID (use 'all' for all vehicles)
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
export const generateVehicleReport = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = generateReportSchema.parse(req.query);

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    // Validate date range
    if (start > end) {
      res.status(400).json({
        success: false,
        message: 'Start date must be before end date',
      });
      return;
    }

    let vehicles: any[] = [];
    let statusRecords: any[] = [];

    if (vehicleId === 'all') {
      // Get all vehicles and their status records
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
    } else {
      // Get specific vehicle
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

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
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

    // Create detailed records sheet
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

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers for file download
    const filename = vehicleId === 'all' 
      ? `vehicle-report-all-${startDate}-to-${endDate}.xlsx`
      : `vehicle-report-${vehicles[0]?.plateNumber}-${startDate}-to-${endDate}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * @swagger
 * /api/reports/generate:
 *   get:
 *     summary: Generate general report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 */
export const generateGeneralReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = generateReportSchema.parse(req.query);

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Validate date range
    if (start > end) {
      res.status(400).json({
        success: false,
        message: 'Start date must be before end date',
      });
      return;
    }

    // Get all vehicles and their status records
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

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
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

    // Create detailed records sheet
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

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers for file download
    const filename = `vehicle-report-${startDate}-to-${endDate}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};