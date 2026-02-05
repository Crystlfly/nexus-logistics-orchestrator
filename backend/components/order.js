import {Router} from 'express';
import sql from 'mssql';
import { createOrder } from '../services/orderService.js';
import {authenticateToken} from '../middleware/auth.js';

const router = Router();

router.post('/api/orders', authenticateToken, async (req, res) => {
    // console.log('User object from middleware:', req.user);
    const username = req.user.name;
    const orderData=req.body;
    try{
        const result = await createOrder(orderData, username);
        
        res.status(201).json({
            status: 201, 
            message: result.message, 
            orderId: result.orderId
        });
    }catch(err){
        const statusCode = err.message.includes('stock') ? 400 : 500;
        res.status(statusCode).json({
            status: statusCode, 
            message: err.message
        });
    }
});
export default router;
