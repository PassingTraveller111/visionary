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


const getUserStatisticChart = async (userId: number, startDate: string, endDate: string) => {
    // 生成连续日期序列的 SQL
    const generateDateSequenceSQL = `
    WITH RECURSIVE date_sequence AS (
        SELECT ? AS date
        UNION ALL
        SELECT DATE_ADD(date, INTERVAL 1 DAY)
        FROM date_sequence
        WHERE DATE_ADD(date, INTERVAL 1 DAY) <= ?
    )`;
    // 统计数据的 SQL
    const statsSQL = `
    SELECT 
        dates.date,
        -- 若点赞数为 NULL 则显示 0
        IFNULL(article_likes.like_count, 0) AS like_count,
        -- 若阅读数为 NULL 则显示 0
        IFNULL(article_reading_records.read_count, 0) AS read_count,
        -- 若收藏数为 NULL 则显示 0
        IFNULL(article_collections.collection_count, 0) AS collection_count
    FROM date_sequence dates
    LEFT JOIN (
        -- 统计点赞数
        SELECT 
            DATE(liked_at) AS liked_date,
            COUNT(*) AS like_count
        FROM article_likes
        JOIN articles ON article_likes.article_id = articles.id
        WHERE articles.author_id = ?
          AND DATE(liked_at) BETWEEN ? AND ?
        GROUP BY DATE(liked_at)
    ) article_likes ON dates.date = article_likes.liked_date
    LEFT JOIN (
        -- 统计阅读数
        SELECT 
            DATE(read_time) AS read_date,
            COUNT(*) AS read_count
        FROM article_reading_records
        JOIN articles ON article_reading_records.article_id = articles.id
        WHERE articles.author_id = ?
          AND DATE(read_time) BETWEEN ? AND ?
        GROUP BY DATE(read_time)
    ) article_reading_records ON dates.date = article_reading_records.read_date
    LEFT JOIN (
        -- 统计收藏数
        SELECT 
            DATE(collect_time) AS collect_date,
            COUNT(*) AS collection_count
        FROM article_collections
        JOIN articles ON article_collections.article_id = articles.id
        WHERE articles.author_id = ?
          AND DATE(collect_time) BETWEEN ? AND ?
        GROUP BY DATE(collect_time)
    ) article_collections ON dates.date = article_collections.collect_date
    ORDER BY dates.date;
    `;

    // 合并 SQL 查询
    const fullSQL = generateDateSequenceSQL + statsSQL;

    // 执行查询
    return await query(fullSQL, [
        startDate, endDate, userId, startDate, endDate, userId, startDate, endDate, userId, startDate, endDate
    ]);
};
export const user = {
    getUserInfoByEmail,
    countByUsername,
    insertUser,
    getUserStatistic,
    getUserStatisticChart,
}