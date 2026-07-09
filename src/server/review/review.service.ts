import pool from "@/lib/db";
import type {ReviewDto} from "@/shared/api/review";

export const getReview = async (reviewId: number): Promise<ReviewDto | null> => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT * FROM reviews WHERE id = ?`, [reviewId]);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] as ReviewDto : null;
    } finally {
        connection.release();
    }
}
