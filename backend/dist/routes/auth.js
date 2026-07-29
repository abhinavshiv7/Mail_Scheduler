"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post('/google', authController_1.googleLogin);
router.post('/login-email', authController_1.loginEmail);
router.post('/register-email', authController_1.registerEmail);
exports.default = router;
