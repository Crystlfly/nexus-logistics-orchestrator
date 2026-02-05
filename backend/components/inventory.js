import sql from 'mssql';
import dbconfigSetup from '../dbconfigSetup.js';
import {Router} from 'express';
import {addProduct, updateProduct, deleteProduct} from '../services/productService.js';
import {authenticateToken} from '../middleware/auth.js';

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

router.post('/api/addProduct', authenticateToken, async (req, res) => {
    try{
        const productData=req.body;
        const result = await addProduct(productData, req.user?.name);
        res.json({status:201, message: result.message, productId: result.productId});
    }catch(err){
        console.error("Error adding product:", err);
        res.status(500).json({error:"Internal Server Error"});
    }
});

router.put('/api/updateProduct/:id', authenticateToken, async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        const productData = req.body;
        await updateProduct(productId, productData);
        res.json({ status: 200, message: "Product updated successfully" });
    } catch (err) {
        console.error("Error updating product:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/api/deleteProduct/:id', authenticateToken, async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10);
        await deleteProduct(productId);
        res.json({ status: 200, message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error deleting product:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;