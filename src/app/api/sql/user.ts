import {query} from "@/app/api/utils";
import {userTableType} from "@/app/api/protected/user/type";



const getUserInfoByEmail = async (email: string) => {
    return (await query(`SELECT * FROM users WHERE email = ?`, [email]));
}
const countByUsername = async (username: string) => {
    return (await query(`SELECT COUNT(*) as recordCount FROM users WHERE username = ?`, [username])) as [[ { recordCount: number } ]] | null
}

const insertUser = async (userInfo: Pick<userTableType, 'username' | 'role' | 'email' | 'password' | 'nick_name'>) => {
    const { username, email, role, nick_name, password } = userInfo;
    return (await query(`INSERT INTO users SET username = ?, email = ?, role = ?, nick_name = ?, password = ?, create_time = ?`, [username, email, role, nick_name, password, new Date()]))
}

export const user = {
    getUserInfoByEmail,
    countByUsername,
    insertUser,
}