import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const getVehiclesSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  sortBy: z.enum(['date', 'plateNumber', 'status']).optional().default('date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const getVehicleStatusSchema = z.object({
  date: z.string().optional(),
});

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles with pagination and sorting
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of vehicles per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, plateNumber, status]
 *           default: date
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of vehicles with pagination
 *       401:
 *         description: Unauthorized
 */
export const getVehicles = async (req: Request, res: Response) => {
  try {
    const { page, limit, sortBy, sortOrder } = getVehiclesSchema.parse(req.query);
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build orderBy object
    let orderBy: any = {};
    if (sortBy === 'date') {
      orderBy = { createdAt: sortOrder };
    } else if (sortBy === 'plateNumber') {
      orderBy = { plateNumber: sortOrder };
    } else if (sortBy === 'status') {
      orderBy = { status: sortOrder };
    }

    // Get vehicles with pagination
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

    // Add location info from latest status record
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
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 *       401:
 *         description: Unauthorized
 */
export const getVehicleById = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * @swagger
 * /api/vehicles/{id}/status:
 *   get:
 *     summary: Get vehicle status records for a specific date
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to get status records for (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Vehicle status records
 *       404:
 *         description: Vehicle not found
 *       401:
 *         description: Unauthorized
 */
export const getVehicleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = getVehicleStatusSchema.parse(req.query);

    // Check if vehicle exists
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

    // Parse date or use today
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get status records for the specified date
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

    // Add location info to each record
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
  } catch (error) {
    console.error('Error fetching vehicle status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Create a new vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plateNumber
 *               - model
 *               - brand
 *               - year
 *             properties:
 *               plateNumber:
 *                 type: string
 *               model:
 *                 type: string
 *               brand:
 *                 type: string
 *               year:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE]
 *     responses:
 *       201:
 *         description: Vehicle created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
export const createVehicle = async (req: Request, res: Response) => {
  try {
    const { plateNumber, model, brand, year, status = 'ACTIVE' } = req.body;

    // Validate required fields
    if (!plateNumber || !model || !brand || !year) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: plateNumber, model, brand, year',
      });
      return;
    }

    // Check if plate number already exists
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
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plateNumber:
 *                 type: string
 *               model:
 *                 type: string
 *               brand:
 *                 type: string
 *               year:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE]
 *     responses:
 *       200:
 *         description: Vehicle updated successfully
 *       404:
 *         description: Vehicle not found
 *       401:
 *         description: Unauthorized
 */
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if vehicle exists
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

    // If updating plate number, check for duplicates
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
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete vehicle
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle ID
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully
 *       404:
 *         description: Vehicle not found
 *       401:
 *         description: Unauthorized
 */
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if vehicle exists
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
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};