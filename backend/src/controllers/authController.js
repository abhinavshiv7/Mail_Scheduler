"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = void 0;
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = __importDefault(require("../config/db"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ error: 'Invalid Google token payload' });
        }
        const { email, name, picture } = payload;
        let user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            // Create new Ethereal test account for dynamic sender
            const testAccount = await nodemailer_1.default.createTestAccount();
            user = await db_1.default.user.create({
                data: {
                    email,
                    name: name || '',
                    avatarUrl: picture || '',
                    etherealUser: testAccount.user,
                    etherealPass: testAccount.pass,
                },
            });
        }
        // Generate App JWT
        const appToken = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token: appToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.googleLogin = googleLogin;
//# sourceMappingURL=authController.js.map