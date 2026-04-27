import { Router } from "express";
import bcrypt from 'bcryptjs'; 
import sql from 'mssql';
import dbconfigSetup from './dbconfigSetup.js';
import jwt from 'jsonwebtoken';
import {establishConnection} from './utils/dbhelper.js';

const config = dbconfigSetup;
const router = Router();

router.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        let pool = await establishConnection(config);
        
        // 1. Find user by email only (using Prepared Statements)
        let result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query("SELECT * FROM Users WHERE Email = @email");

        if (result.recordset.length > 0) {
            const user = result.recordset[0];

            // 2. Compare the plain-text password with the stored hash
            const isMatch = await bcrypt.compare(password, user.PasswordHash);

            if (isMatch) {
                const token = jwt.sign(
                    { id: user.UserId, name: user.FullName, role: user.Role },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                res.cookie('nexus_token', token, {
                    httpOnly: true, // CRITICAL: Hides cookie from malicious JavaScript
                    secure: process.env.NODE_ENV === 'production', // Use true if on HTTPS
                    sameSite: 'lax', // Protects against CSRF attacks
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
                });
                res.status(200).json({ 
                    success: true, 
                    message: "Login Successful",
                    userRole: user.Role,
                    expiresAt: Date.now() + (24 * 60 * 60 * 1000)
                    
                });
            } else {
                res.status(401).json({ success: false, message: "Invalid Credentials" });
            }
        } else {
            res.status(401).json({ success: false, message: "Invalid Credentials" });
        }
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default router;