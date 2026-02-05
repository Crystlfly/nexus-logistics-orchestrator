import express from 'express';
import dotenv from 'dotenv';
import sql from 'mssql';
import cors from 'cors';
import dbconfigSetup from './dbconfigSetup.js';
import login from './login.js';
import signup from './signup.js';
import fleet from './components/fleet.js';
import inventory from './components/inventory.js';
import warehouses from './components/warehouse.js';
import forgotPass from './components/forgotPass.js';
import google from './google.js';
import order from './components/order.js';
import logistic from './components/logistic.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000; 

const config = dbconfigSetup;

app.use(login);
app.use(signup);
app.use(fleet);
app.use(inventory);
app.use(warehouses);
app.use(forgotPass);
app.use(google);
app.use(order);
app.use(logistic);


app.get('/api/logistics/dispatch-queue', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM v_DispatchQueue');
        
        res.json({
            status: 'success',
            data: result.recordset
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.get('/api/logistics/coordinates', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT latitude, longitude FROM Warehouses');
        
        res.json({
            status: 'success',
            data: result.recordset
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// backend/server.js
app.post('/api/orders', async (req, res) => {
    const { productId, quantity, customerName, priority } = req.body;
    try {
        let pool = await sql.connect(config);
        // Executing the Stored Procedure you created in Phase Two
        let result = await pool.request()
            .input('ProductID', sql.Int, productId)
            .input('Qty', sql.Int, quantity)
            .input('CustomerName', sql.NVarChar, customerName)
            .input('Priority', sql.Int, priority)
            .execute('OrderProcessing');
        
        const outcome = result.recordset[0].Result;
        
        if (outcome === 'Order Dispatched') {
            res.json({ status: 'success', message: outcome });
        } else {
            res.status(400).json({ status: 'error', message: outcome });
        }
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Logistics API (ESM) running at http://localhost:${port}`);
});
