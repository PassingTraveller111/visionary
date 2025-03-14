import styles from './index.module.scss';
import {Dropdown, MenuProps, Tag} from "antd";
import moment from "moment";
import {IconFont} from "@/components/IconFont";
import {useRouter} from "next/navigation";


export type ArticleItemProps = {
    title: string; // 标题
    summary?: string; // 摘要
    author?: string; // 作者
    articleId: number; // 文章id
    updateTime?: string; // 更新时间
    likes_count?: number; // 点赞数
    looks_count?: number; // 阅读数
    collect_count?: number; // 收藏数
    comment_count?: number; // 评论数
    tags?: string[]; // 标签
    operateMenuItems?: MenuProps['items'];
}

const ArticleItem = (props: ArticleItemProps) => {
    const { title, summary, author, articleId, updateTime, likes_count = 0, looks_count = 0, operateMenuItems = [], tags = [] } = props;
    const router = useRouter();
    return <div className={styles.ArticleItemContainer}
        onClick={() => router.push('/reader/'+articleId)}
    >
        <div className={styles.leftBar}>
            <div className={styles.title}>{title}</div>
            <div className={styles.summary}>{summary}</div>
            <div className={styles.bottom}>
                <div className={styles.bottomLeft}>
                    {author && <span className={styles.author}>{author}</span>}
                    {updateTime && <span>{moment(updateTime).format('YYYY-MM-DD')}</span>}
                    {likes_count > 0 && <span>
                        <IconFont type='icon-like'/>
                        <span>{likes_count}</span>
                    </span>}
                    {looks_count > 0 && <span>
                        <IconFont type='icon-look'/>
                        <span>{looks_count}</span>
                    </span>}
                </div>
                <div className={styles.bottomRight}>
                    {
                        tags.map((tag) => {
                            return <Tag key={tag}>{tag}</Tag>
                        })
                    }
                </div>

            </div>
        </div>
        {operateMenuItems.length > 0 && <div className={styles.rightBar}
            onClick={(e) => e.stopPropagation()}
        >
            <Dropdown
                menu={{items: operateMenuItems}}
            >
                <IconFont type='icon-more'/>
            </Dropdown>
        </div>
        }
    </div>
}

export default ArticleItem;