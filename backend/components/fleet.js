import {Router} from 'express';
import sql from 'mssql';
import dbconfigSetup from '../dbconfigSetup.js';
import {addFleet, updateFleet, deleteFleet} from '../services/vehicleService.js';
import {authenticateToken} from '../middleware/auth.js';

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

router.post('/api/addFleet', authenticateToken, async (req, res) => {
    try{
        const fleetData=req.body;
        const result = await addFleet(fleetData, req.user?.name);
        res.json({status:201, message: result.message, vehicleId: result.vehicleId});
    }catch (err) {
        console.error("Add Fleet Error:", err.message);
        
        // Check if it's our custom "Warehouse does not exist" error
        if (err.message.includes("does not exist")) {
            // Send 400 Bad Request for validation errors
            res.status(400).json({ 
                status: 400, 
                message: err.message 
            });
        } else {
            // Send 500 for other server errors
            res.status(500).json({ 
                status: 500, 
                message: "Internal server error: " + err.message 
            });
        }
    }
});

router.put('/api/updateFleet/:id', authenticateToken, async (req, res) => {
    try {
        const vehicleId = parseInt(req.params.id, 10);
        const fleetData = req.body;
        await updateFleet(vehicleId, fleetData);
        res.json({ status: 200, message: "Fleet updated successfully" });
    } catch (err) {
        console.error("Error updating fleet:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/api/deleteFleet/:id', authenticateToken, async (req, res) => {
    try {
        const vehicleId = parseInt(req.params.id, 10);
        await deleteFleet(vehicleId);
        res.json({ status: 200, message: "Fleet deleted successfully" });
    } catch (err) {
        console.error("Error deleting fleet:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;