import { establishConnection } from '../utils/dbhelper.js';
import dbconfigSetup from '../dbconfigSetup.js';
import sql from 'mssql';

const config = dbconfigSetup;

export async function createOrder(orderData, authenticatedUsername) {
    if (!authenticatedUsername) {
        throw new Error("Cannot create order: User is not authenticated.");
    }
    const { itemid, quantity, date, priorityLvl, dest } = orderData;
    
    const pool = await establishConnection(config);
    // const transaction = new sql.Transaction(pool);
    const priorityMap = { 'Low':1, 'Normal': 2, 'High': 3 };
    const priorityValue = priorityMap[priorityLvl] || 1;
    
    // Flag to track if transaction is active
    // let transactionStarted = false;

    try {
        // await transaction.begin();
        // transactionStarted = true;

        const request = new sql.Request(pool); // Use the same request object for efficiency

        // 1. Current stock and warehouse_id fetch
        // let cData = await request
        //     .input('itemid', sql.Int, itemid)
        //     .query('SELECT current_stock, warehouse_id, zone_id, per_volume FROM Products WHERE product_id = @itemid AND IsDeleted=0');
        // Use optional chaining and nullish coalescing safely
        // cData= cData.recordset[0];
        // const stock = cData.current_stock;
        
        // if (stock === undefined) throw new Error("Product not found.");
        // if (stock < quantity) throw new Error(`Insufficient stock. Only ${stock} available.`);

        // 2. FIND TRUCK
        // const fleetCheck = await request
        //     .input('warehouseId', sql.Int, cData.warehouseId)
        //     .query(`SELECT TOP 1 vehicle_id FROM Fleet WHERE current_warehouse_id = @warehouseId AND status = 'Idle'`);

        // let assignedTruckId = null;
        // let finalStatus = 'Pending';

        // if (fleetCheck.recordset.length > 0) {
        //     assignedTruckId = fleetCheck.recordset[0].vehicle_id;
        //     finalStatus = 'Dispatched';

        //     await request
        //         .input('truckId', sql.Int, assignedTruckId)
        //         .input('dest_update', sql.VarChar, dest)
        //         .query(`UPDATE Fleet SET status = 'In-Transit', current_route = @dest_update WHERE vehicle_id = @truckId`);
        // }

        // 3. DEDUCT STOCK
        // const stockUpdateResult =new sql.Request(transaction);
        // await stockUpdateResult
        //     .input('qty_deduct', sql.Int, quantity)
        //     .input('itemid', sql.Int, itemid)
        //     .query('UPDATE Products SET current_stock = current_stock - @qty_deduct WHERE product_id = @itemid');
        
        //4. reduce the occupied capacity in the zone and warehouse
        // const reqWhUpdate = new sql.Request(transaction);
        // await reqWhUpdate
        //     .input('warehouseId', sql.Int, cData.warehouse_id)
        //     .input('orderedVolume', sql.Int,cData.per_volume*quantity)
        //     .query(`update warehouses set used_capacity_sqft=used_capacity_sqft-@orderedVolume WHERE warehouse_id = @warehouseId`);

        // const reqZoneUpdate = new sql.Request(transaction);
        // await reqZoneUpdate
        //     .input('zoneId', sql.Int, cData.zone_id)
        //     .input('orderedVolumeZone', sql.Int,cData.per_volume*quantity)
        //     .query(`update zones set current_occupancy=current_occupancy-@orderedVolumeZone WHERE zone_id = @zoneId`);
        
            // 4. CREATE ORDER

        // const orderInsertResult =new sql.Request(transaction);
        request.input('username', sql.NVarChar(255), authenticatedUsername);
        request.input('productId', sql.Int, itemid);
        request.input('qty', sql.Int, quantity);
        request.input('date', sql.DateTime, date);
        request.input('priority', sql.Int, priorityValue);
        request.input('destination', sql.NVarChar(255), dest);
        await request.execute('OrderProcessing');
        
        return {
            success: true,
            message: 'Order Placed Successfully!' 
        };

    } catch (err) {
        // Only rollback if the transaction actually started and hasn't been aborted by the server
        // if (transactionStarted) {
        //     try {
        //         await transaction.rollback();
        //     } catch (rollbackErr) {
        //         console.error("Rollback failed:", rollbackErr.message);
        //     }
        // }
        console.error("Order processing failed:", err.message);
        throw err; // Re-throw the original error so your API can handle it
    }
}