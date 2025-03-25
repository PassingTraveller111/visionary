import styles from './index.module.scss';
import {Dropdown, MenuProps, Tag} from "antd";
import moment from "moment";
import {IconFont} from "@/components/IconFont";
import {useRouter} from "next/navigation";
import Image from "next/image";


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
    cover?: string; // 封面
}

const ArticleItem = (props: ArticleItemProps) => {
    const { title, summary, author, articleId, updateTime, likes_count = 0, looks_count = 0, operateMenuItems = [], tags = [], cover } = props;
    const router = useRouter();
    return <div className={styles.ArticleItemContainer}
        onClick={() => router.push('/reader/'+articleId)}
    >
        <div
            className={styles.leftBar}
            style={{ width: `calc(100% - ${cover ? '120px' : '0px'} - ${operateMenuItems.length > 0 ? '50px' : '0px'})` }}
        >
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
        <div className={styles.rightBar}>
            {cover && <div className={styles.cover}><Image src={cover} alt={''} width={110} height={74} /></div>}
            {operateMenuItems.length > 0 && <div
                className={styles.edit}
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
    </div>
}

export default ArticleItem;