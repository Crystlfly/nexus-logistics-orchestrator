import sql from 'mssql';
import dbconfigSetup from '../dbconfigSetup.js';
import {Router} from 'express';

const router=Router();
const config = dbconfigSetup;

router.get("/api/inventory", async(req,res)=>{
    try{
        const pool =await sql.connect(config);
        const result=await pool.request().query(`SELECT * FROM Products`)
        res.json({status:200, data: result.recordset});
    }
    catch(err){
        console.error("Error fetching inventory:",err);
        res.status(500).json({error:"Internal Server Error"});
    }
});
export default router;