import {query} from "@/app/api/utils";


const setEmailVerifyCode = async (email: string, code: string) => {
    const create_time = new Date();
    const expired_time = new Date(create_time.getTime() + 5 * 60 * 1000);
    return (await query(`INSERT INTO email_verification 
                        SET email = ?, verification_code = ?, create_at = ?, expired_at = ?`,
                        [email, code, create_time, expired_time])
    )
}

const getEmailVerifyCode = async (email: string, code: string) => {
    return (await query(`SELECT * FROM email_verification WHERE email = ? AND verification_code = ?`, [email, code]))
}

export const email_verification = {
    setEmailVerifyCode,
    getEmailVerifyCode,
}