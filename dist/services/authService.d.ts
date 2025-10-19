import { User } from '@prisma/client';
import { LoginInput, RegisterInput } from '@/validators/auth';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface LoginResponse {
    user: Omit<User, 'password'>;
    tokens: AuthTokens;
}
export declare class AuthService {
    static login(credentials: LoginInput): Promise<LoginResponse>;
    static register(userData: RegisterInput): Promise<LoginResponse>;
    static refreshToken(refreshToken: string): Promise<AuthTokens>;
    static logout(userId: string): Promise<void>;
    private static generateTokens;
    static verifyToken(token: string): Promise<{
        userId: string;
    }>;
}
//# sourceMappingURL=authService.d.ts.map