import React from 'react'
import {Button, Form, Input, Popover} from "antd";
import styles from './index.module.scss';
import Tags from "@/components/Tags";
import {useDispatch} from "react-redux";
import {draftType, setDraft} from "@/store/features/draftSlice";
import {Profile} from "@/components/Profile";

type EditorHeaderProps = {
    draft: draftType;
    onTitleChange: (title: string) => void;
    onSaveDraft: () => void;
    onPublicArticle: () => void;
}


const EditorHeader= (props: EditorHeaderProps) => {
    const { draft, onTitleChange, onSaveDraft, onPublicArticle } = props;
    const dispatch = useDispatch();

    return <div className={styles.editorHeaderContainer}>
        <div className={styles.title}>
            <Input
                value={draft.title}
                placeholder="请输入标题"
                maxLength={30}
                onChange={(e) => onTitleChange(e.target.value)}
            />
        </div>
        <div className={styles.tools}>
            <Button
                type="primary"
                onClick={onSaveDraft}
            >保存到草稿箱</Button>
            <Popover
                title='发布'
                trigger='click'
                content={<div className={styles.publishContainer}>
                    <Form
                        labelCol={{span: 4}}
                        wrapperCol={{span: 16}}
                    >
                        <Form.Item
                            required
                            label='标签'
                            validateStatus={ draft.tags.length ? '' : 'error' }
                            help={ draft.tags.length ? '' : '至少要有一个标签'}
                        >
                            <Tags
                                tags={draft.tags}
                                onChange={(value) => {
                                    dispatch(setDraft({
                                        ...draft,
                                        tags: value,
                                    }))
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            required
                            label='摘要'
                            validateStatus={ draft.summary ? '' : 'error' }
                            help={ draft.summary ? '' : '摘要不能为空'}
                        >
                            <Input.TextArea
                                rows={4}
                                maxLength={100}
                                showCount
                                value={draft.summary}
                                onChange={(e) => {
                                    dispatch(setDraft({
                                        ...draft,
                                        summary: e.target.value,
                                    }))
                                }}
                            />
                        </Form.Item>
                        <Button onClick={() => {
                            if(!draft.summary || draft.tags.length === 0) return;
                            onPublicArticle()
                        }}>确定并发布</Button>
                    </Form>
                </div>}
            >
                <Button type="primary" >发布</Button>
            </Popover>
            <Profile/>
        </div>
    </div>
}

export default EditorHeader;