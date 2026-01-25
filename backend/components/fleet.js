import {Router} from 'express';
import sql from 'mssql';
import dbconfigSetup from '../dbconfigSetup.js';

const config = dbconfigSetup;
const router = Router();

router.get('/api/fleet', async (req, res) => {
    try{
        const pool= await sql.connect(config);
        const result = await pool.request().query(`
            SELECT 
                f.*, 
                w.location_name AS warehouse_location 
            FROM Fleet f 
            LEFT JOIN Warehouses w ON f.current_warehouse_id = w.warehouse_id
        `);
        res.json({status:200, data: result.recordset});
    }
    catch(err){
        console.error("Fleet Fetch Error:", err.message);
        res.json({status:500, message:"Internal server error: " + err.message});
    }
});
export default router;