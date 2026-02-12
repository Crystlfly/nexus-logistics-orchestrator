import sql from 'mssql';
import { establishConnection } from '../utils/dbhelper.js';
import dbconfigSetup from '../dbconfigSetup.js';

const config = dbconfigSetup;

export async function updateUser(userId, userData) {
    try {
        const pool = await establishConnection(config);
        const { fullName, email, roleId } = userData;
        await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .input('fullName', sql.VarChar, fullName)
            .input('email', sql.VarChar, email)
            .input('roleId', sql.Int, roleId)
            .query(`
                UPDATE Users SET FullName = @fullName, Email = @email, RoleId = @roleId WHERE UserId = @id
            `);
    }   catch (err) {
        throw err;
    }   
};

export async function deleteUser(userId) {
    try{
        const pool = await establishConnection(config);
        await pool.request()
            .input('id', sql.UniqueIdentifier, userId)
            .query(`
                UPDATE Users SET IsDeleted = 1 WHERE UserId = @id
            `);
    }catch(err){
        throw err;
    }
};