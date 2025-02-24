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
                content={<>
                    <Form
                        labelCol={{span: 4}}
                        wrapperCol={{span: 16}}
                    >
                        <Form.Item
                            label='标签'
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
                            label='摘要'
                        >
                            <Input.TextArea
                                rows={4}
                                value={draft.summary}
                                onChange={(e) => {
                                    dispatch(setDraft({
                                        ...draft,
                                        summary: e.target.value,
                                    }))
                                }}
                            />
                        </Form.Item>
                        <Button onClick={onPublicArticle}>确定并发布</Button>
                    </Form>
                </>}
            >
                <Button type="primary" >发布</Button>
            </Popover>
            <Profile/>
        </div>
    </div>
}

export default EditorHeader;