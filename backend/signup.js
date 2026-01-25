import { Router } from "express";
import sql from 'mssql';
import bcrypt from 'bcryptjs'; 
import dbconfigSetup from './dbconfigSetup.js';

const config = dbconfigSetup;
const router = Router();

router.post("/api/signup", async (req, res) => {
    const { fullname, email, companyName, password } = req.body;
    try {
        const pool = await sql.connect(config);

        // 1. Check for existing user using Prepared Statements
        const checkResult = await pool.request()
            .input('email', sql.NVarChar, email)
            .query("SELECT * FROM Users WHERE Email = @email");

        if (checkResult.recordset.length > 0) {
            return res.json({ status: 409, message: "User already exists" });
        }

        // 2. Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insert using correct Azure SQL columns
        const insertRes = await pool.request()
            .input('fullname', sql.NVarChar, fullname)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO Users (UserId, FullName, Email, PasswordHash, RoleId) 
                VALUES (NEWID(), @fullname, @email, @password, 2)
            `);

        if (insertRes.rowsAffected[0] > 0) {
            res.json({ status: 201, message: "User registered successfully", success: true });
        } else {
            res.json({ status: 500, message: "Error registering user" });
        }

    } catch (err) {
        console.error("Signup Error:", err.message);
        res.json({ status: 500, message: "Internal server error: " + err.message });
    }
});

export default router;