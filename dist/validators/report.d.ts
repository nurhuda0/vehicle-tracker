import { z } from 'zod';
export declare const generateReportSchema: z.ZodObject<{
    query: z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodString;
        vehicleId: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["TRIP", "IDLE", "STOPPED"]>>;
        format: z.ZodDefault<z.ZodEnum<["xlsx", "csv"]>>;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        endDate: string;
        format: "xlsx" | "csv";
        status?: "TRIP" | "IDLE" | "STOPPED" | undefined;
        vehicleId?: string | undefined;
    }, {
        startDate: string;
        endDate: string;
        status?: "TRIP" | "IDLE" | "STOPPED" | undefined;
        vehicleId?: string | undefined;
        format?: "xlsx" | "csv" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        startDate: string;
        endDate: string;
        format: "xlsx" | "csv";
        status?: "TRIP" | "IDLE" | "STOPPED" | undefined;
        vehicleId?: string | undefined;
    };
}, {
    query: {
        startDate: string;
        endDate: string;
        status?: "TRIP" | "IDLE" | "STOPPED" | undefined;
        vehicleId?: string | undefined;
        format?: "xlsx" | "csv" | undefined;
    };
}>;
export type GenerateReportInput = z.infer<typeof generateReportSchema>['query'];
//# sourceMappingURL=report.d.ts.map