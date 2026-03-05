import sql from 'mssql';
import { establishConnection } from '../utils/dbhelper.js';
import dbconfigSetup from '../dbconfigSetup.js';

const config = dbconfigSetup;

export async function addProduct(productData, authenticatedUsername) {
    if(!authenticatedUsername) {
        throw new Error("Cannot add product: User is not authenticated.");
    }
    try{
        const pool = await establishConnection(config);
        const {name, sku, reorderLevel, currentStock, unitPrice, category, status, volume}=productData;
        const total_vol=currentStock*volume;

        const warehouseRequest = pool.request();
        warehouseRequest.input('requiredVolume', sql.Float, total_vol);
        console.log(total_vol);
        const warehouseResult = await warehouseRequest.query(`
            SELECT TOP 1 warehouse_id 
            FROM Warehouses 
            WHERE (total_capacity_sqft - used_capacity_sqft) >= @requiredVolume AND
            IsDeleted=0
            ORDER BY (total_capacity_sqft - used_capacity_sqft) DESC

        `);

        if (warehouseResult.recordset.length === 0) {
            throw new Error("No warehouse has enough capacity for this product.");
        }

        const warehouseId = warehouseResult.recordset[0].warehouse_id;

        const zoneid=pool.request();
        zoneid.input('wid', sql.Int, warehouseId);
        zoneid.input('requiredVolume', sql.Float, total_vol)
        const zoneResult= await zoneid.query(`
            select top 1 zone_id
            from zones 
            where warehouse_id=@wid And
            (capacity_limit-current_occupancy)>@requiredVolume AND
            IsDeleted=0
            ORDER BY (capacity_limit - current_occupancy) DESC
            `);
        const zoneId=zoneResult.recordset[0].zone_id;
        
        
        const insertResult = await pool.request()
            .input('name', sql.VarChar, name)
            .input('sku', sql.VarChar, sku)
            .input('reorderLevel', sql.Int, reorderLevel)
            .input('currentStock', sql.Int, currentStock)
            .input('unitPrice', sql.Decimal(18,2), unitPrice)
            .input('category', sql.VarChar, category)
            .input('status', sql.VarChar, status)
            .input('warehouseId', sql.Int, warehouseId)
            .input('zoneId', sql.Int, zoneId)
            .input('requiredVolume', sql.Float, total_vol)
            .input('per_volume', sql.Int, volume)
            .query(`
                INSERT INTO Products (name, sku, reorder_level, current_stock, unit_price, category, status, total_volume_occupancy, warehouse_id, zone_id, per_volume) 
                OUTPUT INSERTED.product_id
                VALUES (@name, @sku, @reorderLevel, @currentStock, @unitPrice, @category, @status, @requiredVolume, @warehouseId, @zoneId, @per_volume)

                UPDATE Warehouses 
                SET used_capacity_sqft = used_capacity_sqft + @requiredVolume
                WHERE warehouse_id = @warehouseId;

                update Zones
                set current_occupancy=current_occupancy+@requiredVolume
                where zone_id= @zoneId;
            `);
        if (insertResult.recordset && insertResult.recordset[0]) {
            return { 
                status: "success", 
                message: "Product added successfully",
                productId: insertResult.recordset[0].product_id 
            };
        } else {
            throw new Error("Error adding product");
        }
    }catch(err){
        throw err;
    }
}

export async function updateProduct(productId, productData) {
    try {
        const pool = await establishConnection(config);
        const { name, sku, reorderLevel, currentStock, unitPrice, category, status } = productData;
        
        await pool.request()
            .input('id', sql.Int, productId)
            .input('name', sql.VarChar, name)
            .input('sku', sql.VarChar, sku)
            .input('reorderLevel', sql.Int, reorderLevel)
            .input('currentStock', sql.Int, currentStock)
            .input('unitPrice', sql.Decimal(18, 2), unitPrice)
            .input('category', sql.VarChar, category)
            .input('status', sql.VarChar, status)
            .query(`
                UPDATE Products 
                SET name = @name, sku = @sku, reorder_level = @reorderLevel, 
                    current_stock = @currentStock, unit_price = @unitPrice, 
                    category = @category, status = @status
                WHERE product_id = @id
            `);

        return { status: "success", message: "Product updated successfully" };
    } catch (err) {
        throw err;
    }
}

export async function deleteProduct(productId) {
    try {
        const pool = await establishConnection(config);
        await pool.request()
            .input('id', sql.Int, productId)
            .query('UPDATE Products SET isDeleted=1 WHERE product_id = @id');
            
        return { status: "success", message: "Product deleted successfully" };
    } catch (err) {
        throw err;
    }
}