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
        const {name, sku, reorderLevel, currentStock, unitPrice, category, status}=productData;
        const insertResult = await pool.request()
            .input('name', sql.VarChar, name)
            .input('sku', sql.VarChar, sku)
            .input('reorderLevel', sql.Int, reorderLevel)
            .input('currentStock', sql.Int, currentStock)
            .input('unitPrice', sql.Decimal(18,2), unitPrice)
            .input('category', sql.VarChar, category)
            .input('status', sql.VarChar, status)
            .query(`
                INSERT INTO Products (name, sku, reorder_level, current_stock, unit_price, category, status) 
                OUTPUT INSERTED.product_id
                VALUES (@name, @sku, @reorderLevel, @currentStock, @unitPrice, @category, @status)
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