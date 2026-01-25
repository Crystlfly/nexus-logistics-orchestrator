import {Router} from 'express';
import sql from 'mssql';
import dbconfigSetup from '../dbconfigSetup.js';

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

export default router;