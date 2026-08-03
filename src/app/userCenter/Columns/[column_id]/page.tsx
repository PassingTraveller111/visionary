import {cache} from "react";
import type {Metadata} from "next";
import {cookies} from "next/headers";
import {notFound} from "next/navigation";
import NavLayout from "@/components/NavLayout";
import {getArticleListByColumnId} from "@/server/article/article.service";
import {getColumnById} from "@/server/columns/columns.service";
import {verifyToken} from "@/utils/auth";
import ColumnsPageContent from "./ColumnsPageContent";

export const dynamic = "force-dynamic";

const siteUrl = "https://visionaryblog.cn";
const getColumn = cache(getColumnById);

type ColumnsPageProps = {
    params: Promise<{
        column_id: string;
    }>;
};

const parseColumnId = (value: string) => {
    const columnId = Number(value);
    return Number.isInteger(columnId) && columnId > 0 ? columnId : 0;
};

const getViewerUserId = async () => {
    const token = (await cookies()).get("token")?.value;
    if (!token) return 0;

    try {
        return verifyToken(token).userId;
    } catch {
        return 0;
    }
};

export async function generateMetadata({params}: ColumnsPageProps): Promise<Metadata> {
    const {column_id: columnIdParam} = await params;
    const column = await getColumn(parseColumnId(columnIdParam));
    if (!column) return {};

    return {
        title: `${column.column_name} | 创见`,
        description: column.description,
        alternates: {
            canonical: `${siteUrl}/userCenter/Columns/${column.column_id}`,
        },
        openGraph: {
            title: `${column.column_name} | 创见`,
            description: column.description,
            images: column.cover_image ? [column.cover_image] : undefined,
            type: "website",
        },
    };
}

const ColumnsPage = async ({params}: ColumnsPageProps) => {
    const {column_id: columnIdParam} = await params;
    const columnId = parseColumnId(columnIdParam);
    const [column, articleList] = await Promise.all([
        getColumn(columnId),
        getArticleListByColumnId(columnId, await getViewerUserId()),
    ]);
    if (!column) notFound();

    return <NavLayout>
        <ColumnsPageContent column={column} articleList={articleList ?? []}/>
    </NavLayout>;
};

export default ColumnsPage;
