import pool from "@/lib/db";
import {userTableType} from "@/app/api/sql/type";

export type AuthorInfoType = Pick<userTableType, 'id' | 'email' | 'profile' | 'nick_name'>;

export type getAuthorInfoRequestType = {
    authorId: number;
}

export type getAuthorInfoResponseType = {
    msg: 'success' | 'error';
    data: AuthorInfoType;
}

export type getProfileRequestType = {
    userId: number;
}

export type getProfileResponseType = {
    msg: 'success' | 'error';
    data?: Pick<userTableType, 'id' | 'username' | 'profile' | 'nick_name'>;
}

export const getAuthorInfo = async (authorId: number) => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT id, email, profile, nick_name FROM users WHERE id = ?`, [authorId]);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] as AuthorInfoType : null;
    } finally {
        connection.release();
    }
}

export const getProfile = async (userId: number) => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT id, username, profile, nick_name FROM users WHERE id = ?`, [userId]);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] as getProfileResponseType['data'] : null;
    } finally {
        connection.release();
    }
}
