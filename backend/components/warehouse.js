import {Router} from 'express';
import sql from 'mssql';
import dbconfigSetup from '../dbconfigSetup.js';
import {addWarehouse, updateWarehouse, deleteWarehouse} from '../services/warehouseService.js';
import {authenticateToken} from '../middleware/auth.js';


const router=Router();
const config = dbconfigSetup;

router.get("/api/warehouses", async(req,res)=>{
    try{
        const pool=await sql.connect(config);
        const result=await pool.request().query(`SELECT * FROM Warehouses`);
        res.json({status:200, data: result.recordset});

    }catch(err){
        res.status(500).json({error:"Internal Server Error"});
    }
});

router.get("/api/zones", async(req,res)=>{
    try{
        const pool=await sql.connect(config);
        const result=await pool.request().query(`SELECT * FROM Zones`);
        res.json({status:200, data: result.recordset});
    }catch(err){
        res.status(500).json({error:"Internal Server Error"});
    }
});

router.post('/api/addWarehouse', authenticateToken, async (req, res) => {
    try{
        const warehouseData=req.body;
        const result = await addWarehouse(warehouseData, req.user?.name);
        res.json({status:201, message: result.message, warehouseId: result.warehouseId});
    }catch(err){
        console.error("Add Warehouse Error:", err.message);
        res.json({status:500, message:"Internal server error: " + err.message});
    }
});

router.put('/api/updateWarehouse/:id', authenticateToken, async (req, res) => {
    try {
        const warehouseId = parseInt(req.params.id, 10);
        const warehouseData = req.body;
        await updateWarehouse(warehouseId, warehouseData);
        res.json({ status: 200, message: "Warehouse updated successfully" });
    } catch (err) {
        console.error("Error updating warehouse:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/api/deleteWarehouse/:id', authenticateToken, async (req, res) => {
    try {
        const warehouseId = parseInt(req.params.id, 10);
        await deleteWarehouse(warehouseId);
        res.json({ status: 200, message: "Warehouse deleted successfully" });
    } catch (err) {
        console.error("Error deleting warehouse:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
export default router;