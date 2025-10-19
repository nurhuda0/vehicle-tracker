"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
class AuthService {
    static async login(credentials) {
        const { email, password } = credentials;
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        const tokens = this.generateTokens(user.id);
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            tokens,
        };
    }
    static async register(userData) {
        const { email, password, name, role } = userData;
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                role,
            },
        });
        const tokens = this.generateTokens(user.id);
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            tokens,
        };
    }
    static async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, isActive: true },
            });
            if (!user || !user.isActive) {
                throw new Error('Invalid refresh token');
            }
            return this.generateTokens(user.id);
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    static async logout(userId) {
        return Promise.resolve();
    }
    static generateTokens(userId) {
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
        const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        const accessToken = jsonwebtoken_1.default.sign({ userId }, jwtSecret, { expiresIn });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, jwtRefreshSecret, { expiresIn: refreshExpiresIn });
        return {
            accessToken,
            refreshToken,
        };
    }
    static async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            return { userId: decoded.userId };
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map