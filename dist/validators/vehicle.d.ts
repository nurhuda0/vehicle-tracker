import { z } from 'zod';
export declare const createVehicleSchema: z.ZodObject<{
    body: z.ZodObject<{
        plateNumber: z.ZodString;
        model: z.ZodString;
        brand: z.ZodString;
        year: z.ZodNumber;
        status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE", "MAINTENANCE"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
        plateNumber: string;
        model: string;
        brand: string;
        year: number;
    }, {
        plateNumber: string;
        model: string;
        brand: string;
        year: number;
        status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
        plateNumber: string;
        model: string;
        brand: string;
        year: number;
    };
}, {
    body: {
        plateNumber: string;
        model: string;
        brand: string;
        year: number;
        status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
    };
}>;
export declare const updateVehicleSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        plateNumber: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        brand: z.ZodOptional<z.ZodString>;
        year: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "MAINTENANCE"]>>;
    }, "strip", z.ZodTypeAny, {
        status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
        plateNumber?: string | undefined;
        model?: string | undefined;
        brand?: string | undefined;
        year?: number | undefined;
    }, {
        status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
        plateNumber?: string | undefined;
        model?: string | undefined;
        brand?: string | undefined;
        year?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
        plateNumber?: string | undefined;
        model?: string | undefined;
        brand?: string | undefined;
        year?: number | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | undefined;
        plateNumber?: string | undefined;
        model?: string | undefined;
        brand?: string | undefined;
        year?: number | undefined;
    };
}>;
export declare const getVehicleSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const deleteVehicleSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const getVehicleStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    query: z.ZodObject<{
        date: z.ZodOptional<z.ZodString>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        date?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    query: {
        date?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    query: {
        date?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
}>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>['body'];
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>['body'];
export type GetVehicleInput = z.infer<typeof getVehicleSchema>['params'];
export type DeleteVehicleInput = z.infer<typeof deleteVehicleSchema>['params'];
export type GetVehicleStatusInput = z.infer<typeof getVehicleStatusSchema>['params'] & z.infer<typeof getVehicleStatusSchema>['query'];
//# sourceMappingURL=vehicle.d.ts.map