import { establishConnection } from '../utils/dbhelper.js';
import dbconfigSetup from '../dbconfigSetup.js';
import sql from 'mssql';

const config = dbconfigSetup;

export async function createOrder(orderData, authenticatedUsername) {
    if (!authenticatedUsername) {
        throw new Error("Cannot create order: User is not authenticated.");
    }
    const { itemid, quantity, date, priorityLvl, dest, warehouseId } = orderData;
    
    const pool = await establishConnection(config);
    const transaction = new sql.Transaction(pool);
    const priorityMap = { 'Normal':1, 'Low': 2, 'Medium': 3 };
    const priorityValue = priorityMap[priorityLvl] || 1;
    
    // Flag to track if transaction is active
    let transactionStarted = false;

    try {
        await transaction.begin();
        transactionStarted = true;

        const request = new sql.Request(transaction); // Use the same request object for efficiency

        // 1. CHECK STOCK
        const stockCheck = await request
            .input('itemid', sql.Int, itemid)
            .query('SELECT current_stock FROM Products WHERE product_id = @itemid');
            
        // Use optional chaining and nullish coalescing safely
        const stock = stockCheck.recordset[0]?.current_stock;
        
        if (stock === undefined) throw new Error("Product not found.");
        if (stock < quantity) throw new Error(`Insufficient stock. Only ${stock} available.`);

        // 2. FIND TRUCK
        const fleetCheck = await request
            .input('warehouseId', sql.Int, warehouseId)
            .query(`SELECT TOP 1 vehicle_id FROM Fleet WHERE current_warehouse_id = @warehouseId AND status = 'Idle'`);

        let assignedTruckId = null;
        let finalStatus = 'Pending';

        if (fleetCheck.recordset.length > 0) {
            assignedTruckId = fleetCheck.recordset[0].vehicle_id;
            finalStatus = 'Dispatched';

            await request
                .input('truckId', sql.Int, assignedTruckId)
                .input('dest_update', sql.VarChar, dest)
                .query(`UPDATE Fleet SET status = 'In-Transit', current_route = @dest_update WHERE vehicle_id = @truckId`);
        }

        // 3. DEDUCT STOCK
        await request
            .input('qty_deduct', sql.Int, quantity)
            .query('UPDATE Products SET current_stock = current_stock - @qty_deduct WHERE product_id = @itemid');

        // 4. CREATE ORDER
        await request
            .input('username', sql.VarChar, authenticatedUsername)
            .input('order_qty', sql.Int, quantity)
            .input('order_date', sql.DateTime, date)
            .input('priority', sql.Int, priorityValue)
            .input('status_str', sql.VarChar, finalStatus)
            .input('dest_addr', sql.VarChar, dest)
            .input('wh_id', sql.Int, warehouseId)
            .input('assigned_v_id', sql.Int, assignedTruckId)
            .query(`
                INSERT INTO Orders (
                    customer_name, product_id, quantity, order_date, 
                    priority_level, order_status, destination_address, 
                    warehouse_id, assigned_vehicle_id
                ) 
                VALUES (
                    @username, @itemid, @order_qty, @order_date, 
                    @priority, @status_str, @dest_addr, 
                    @wh_id, @assigned_v_id
                )
            `);

        await transaction.commit();
        
        return {
            success: true,
            message: finalStatus === 'Dispatched' 
                ? `Order Dispatched! Truck #${assignedTruckId} assigned.` 
                : `Order Pending. Stock reserved, but no trucks available.`
        };

    } catch (err) {
        // Only rollback if the transaction actually started and hasn't been aborted by the server
        if (transactionStarted) {
            try {
                await transaction.rollback();
            } catch (rollbackErr) {
                console.error("Rollback failed:", rollbackErr.message);
            }
        }
        throw err; // Re-throw the original error so your API can handle it
    }
}