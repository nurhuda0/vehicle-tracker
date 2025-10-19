import { z } from 'zod';
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
        role: z.ZodDefault<z.ZodEnum<["ADMIN", "USER"]>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
        name: string;
        role: "ADMIN" | "USER";
    }, {
        email: string;
        password: string;
        name: string;
        role?: "ADMIN" | "USER" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        password: string;
        name: string;
        role: "ADMIN" | "USER";
    };
}, {
    body: {
        email: string;
        password: string;
        name: string;
        role?: "ADMIN" | "USER" | undefined;
    };
}>;
export declare const updateUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        email: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodEnum<["ADMIN", "USER"]>>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        name?: string | undefined;
        role?: "ADMIN" | "USER" | undefined;
        isActive?: boolean | undefined;
    }, {
        email?: string | undefined;
        name?: string | undefined;
        role?: "ADMIN" | "USER" | undefined;
        isActive?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        email?: string | undefined;
        name?: string | undefined;
        role?: "ADMIN" | "USER" | undefined;
        isActive?: boolean | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        email?: string | undefined;
        name?: string | undefined;
        role?: "ADMIN" | "USER" | undefined;
        isActive?: boolean | undefined;
    };
}>;
export declare const getUserSchema: z.ZodObject<{
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
export declare const deleteUserSchema: z.ZodObject<{
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
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type GetUserInput = z.infer<typeof getUserSchema>['params'];
export type DeleteUserInput = z.infer<typeof deleteUserSchema>['params'];
//# sourceMappingURL=user.d.ts.map