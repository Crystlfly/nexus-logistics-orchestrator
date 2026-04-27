import { Router } from "express";
import sql from "mssql";
import dbconfigSetup from "../dbconfigSetup.js";
import {authenticateToken} from '../middleware/auth.js';

const router = Router();
const config = dbconfigSetup;

router.get("/api/logistics", authenticateToken, async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status || "";
    const vehicle = req.query.vehicle || "";
    let whereClause = "WHERE 1=1";
    const createRequest = () => {
      const req = pool.request();
      if (search) req.input("search", sql.VarChar, `%${search}%`);
      if (status) req.input("status", sql.VarChar, status);
      if (vehicle) req.input("vehicle", sql.VarChar, vehicle);
      req.input("offset", sql.Int, offset);
      req.input("limit", sql.Int, limit);
      return req;
    };

    if (search) {
      whereClause += " AND (CAST(order_id AS VARCHAR(255)) LIKE @search OR origin LIKE @search OR destination LIKE @search OR carrier LIKE @search)";
    }
    if (status) {
      whereClause += " AND order_status = @status";
    }
    if (vehicle) {
      whereClause += " AND vehicle_type = @vehicle";
    }

    const result = await createRequest().query(`SELECT * FROM ActiveShipments ${whereClause} ORDER BY order_id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`);
    const countQuery = await createRequest().query(`SELECT COUNT(*) as total FROM ActiveShipments ${whereClause}`);
    
    const totalItems = countQuery.recordset[0].total;
    const totalPages = Math.ceil(totalItems / limit);
    res.json({ status: 200, data: result.recordset, totalItems, totalPages });
  } catch (err) {
    console.error("Logistics Fetch Error:", err.message);
    res.json({ status: 500, message: "Internal server error: " + err.message });
  }
});

export default router;