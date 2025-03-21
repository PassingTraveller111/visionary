import {query} from "@/app/api/utils";
import {userTableType} from "@/app/api/protected/user/type";
import {statisticDataType} from "@/app/api/protected/user/getUserStatistic/route";



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

const getUserStatistic = async (userId: number) => {
    return (await query(`SELECT
                             DATEDIFF(CURRENT_DATE, u.create_time) AS days_count,
                             COUNT(DISTINCT ar.id) AS articles_count,
                             COUNT(DISTINCT al.id) AS likes_count,
                             COUNT(DISTINCT ac.id) AS collections_count,
                             COUNT(DISTINCT arr.record_id) AS looks_count
                         FROM
                             users AS u
                                 LEFT JOIN
                             articles AS ar ON u.id = ar.author_id
                                 LEFT JOIN
                             article_likes AS al ON al.article_id = ar.id
                                 LEFT JOIN
                             article_collections AS ac ON ac.article_id = ar.id
                                 LEFT JOIN
                             article_reading_records AS arr ON arr.article_id = ar.id
                         WHERE
                             u.id = ?
                         GROUP BY
                             u.id, u.create_time;`,
                        [userId])) as [[ statisticDataType ]] | null
}

export const user = {
    getUserInfoByEmail,
    countByUsername,
    insertUser,
    getUserStatistic,
}