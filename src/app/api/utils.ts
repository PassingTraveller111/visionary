import pool from "@/lib/db";


export const query = async (sql: string, values?: unknown[]) => {
    const connection = await pool.getConnection();
    try {
        return await connection.execute(sql, values);
    } catch (e) {
        console.error(e);
        return null;
    } finally {
        connection.release();
    }
}