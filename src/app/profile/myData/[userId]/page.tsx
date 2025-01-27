'use client'
import {useParams} from "next/navigation";

const MyDataPage = () => {
    const { userId } =  useParams();
    return <>
        myDataPage{userId}
    </>
}

export default MyDataPage;