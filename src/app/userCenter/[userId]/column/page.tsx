'use client'
import styles from './index.module.scss';
import { useRouter } from "next/navigation";
import {columnsTableType} from "@/app/api/sql/type";
import { useGetColumns } from "@/hooks/columns/useColumns";
import Image from "next/image";
import dayjs from "dayjs";

const ColumnPage = () => {
    const [ columns ] = useGetColumns();
    return <>
        <div
            className={styles.collectContainer}
        >
            <div>
                <ColumnList columns={columns} />
            </div>
        </div>
    </>
}

export default ColumnPage;


const ColumnList = (props: { columns: columnsTableType[] }) => {
    const { columns } = props;
    const router = useRouter();
    const gotoManage = (column_id: number) => {
        router.push(`/userCenter/Columns/${column_id}`);
    }
    return <div>
        {columns.map(column => {
            return <div
                key={column.column_id}
                className={styles.columnsItem}
                onClick={() => {
                    gotoManage(column.column_id);
                }}
            >
                <div className={styles.columnsItemLeft} >
                    <div className={styles.cover}>
                        {column.cover_image && <Image src={column.cover_image} alt={''} width={150} height={116} />}
                    </div>
                    <div className={styles.text}>
                        <div className={styles.name}>{column.column_name}</div>
                        <div className={styles.description}>{column.description}</div>
                        <div className={styles.time}>{dayjs(column.created_at).format('YYYY-MM-DD')}</div>
                    </div>
                </div>
            </div>
        })}
    </div>
}
