import { Router } from "express";
import sql from "mssql";
import dbconfigSetup from "../dbconfigSetup.js";

const router = Router();
const config = dbconfigSetup;

router.get("/api/logistics", async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('select * from ActiveShipments');
    res.json({ status: 200, data: result.recordset });
  } catch (err) {
    console.error("Logistics Fetch Error:", err.message);
    res.json({ status: 500, message: "Internal server error: " + err.message });
  }
});

export default router;