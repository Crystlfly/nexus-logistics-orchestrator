import { Router } from "express";
import { updateUser, deleteUser } from "../services/userService.js";
import { authenticateToken } from "../middleware/auth.js";
import sql from 'mssql';
import dbconfigSetup from '../dbconfigSetup.js';

const router =Router();
const config=dbconfigSetup;

router.get("/api/users", async (req, res) => {
    try{
        const pool = await sql.connect(config);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        const search = req.query.search || "";
        const category = req.query.category || "";

        let whereClause = "WHERE 1=1";
        const createRequest = () => {
            const req = pool.request();
            if (search) req.input("search", sql.VarChar, `%${search}%`);
            if (category && category !== "All Roles") req.input("category", sql.VarChar, category);
            return req;
        };

        if (search) {
            whereClause += " AND (username LIKE @search OR email LIKE @search OR role LIKE @search)";
        }
        if (category && category !== "All Roles") {
            whereClause += " AND role = @category";
        }
        
        const query = `
            SELECT UserId, FullName, Email, Role FROM Users ${whereClause} AND IsDeleted = 0
            ORDER BY UserId OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `;
        const request = createRequest();
        request.input("offset", sql.Int, offset);
        request.input("limit", sql.Int, limit);

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.put('/api/updateUser/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;
    try {
        if (req.user.role !== 'system_admin') {
            return res.status(403).json({ message: "Access Denied. Your are not authorized for this request." });
        }
        await updateUser(userId, userData);
        res.json({ status: 200, message: "User updated successfully" });
    } catch (err) {
        console.error("Update User Error:", err.message);
        res.status(500).json({ error: "Internal server error: " + err.message });
    }
});

router.delete('/api/deleteUser/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    try {
        if (req.user.role !== 'system_admin') {
            return res.status(403).json({ message: "Access Denied. Your are not authorized for this request." });
        }
        else if(req.user.id == userId){
            return res.status(403).json({ message: "Access Denied. You cannot delete your own account." });
        }
        console.log("Deleting user with ID:", userId);
        console.log("Request made by user:", req.user.id);
        await deleteUser(userId);
        res.json({ status: 200, message: "User deleted successfully" });
    } catch (err) {
        console.error("Delete User Error:", err.message);
        res.status(500).json({ error: "Internal server error: " + err.message });
    }
});

export default router;