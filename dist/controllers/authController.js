"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.refreshToken = exports.register = exports.login = void 0;
const authService_1 = require("../services/authService");
const login = async (req, res) => {
    try {
        const result = await authService_1.AuthService.login(req.body);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : 'Login failed',
        });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const result = await authService_1.AuthService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : 'Registration failed',
        });
    }
};
exports.register = register;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const tokens = await authService_1.AuthService.refreshToken(refreshToken);
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: tokens,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : 'Token refresh failed',
        });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        if (req.user) {
            await authService_1.AuthService.logout(req.user.id);
        }
        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Logout failed',
        });
    }
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: req.user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to get profile',
        });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map