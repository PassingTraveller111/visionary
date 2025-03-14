"use client"
import {Button, Input, Tooltip} from "antd";
import styles from './index.module.scss';
import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import MyReactMarkdown from "@/components/ReactMarkdown";
import classNames from "classnames";
import {IconFont} from "@/components/IconFont";
import {useAppSelector} from "@/store";
import Image from "next/image";
import {chatContentType} from "@/app/api/sql/type";
import {useSendMessage} from "@/hooks/assistant_chat/useAssistantChant";
import {useDispatch} from "react-redux";
import {setAssistant} from "@/store/features/assistantSlice";


const Assistant = () => {
    const [isOpen, setIsOpen] = useState(true);
    const assistant = useAppSelector(state => state.rootReducer.assistantReducer.value);
    const dispatch = useDispatch();
    const {
        isLoading,
        sendMessage,
    } = useSendMessage();
    const [inputValue, setInputValue] = useState('');
    const onSendMessage = () => {
        if (inputValue === '') return;
        const problem: chatContentType = [{
            role: 'user',
            content: inputValue,
            sendTime: new Date().toString(),
        }]
        setInputValue('');
        dispatch(setAssistant({
            ...assistant,
            chat_content: [
                ...assistant.chat_content,
                ...problem,
            ]
        }))
        sendMessage(assistant.chat_id, problem).then(res => {
            if(res.msg === 'success')
            dispatch(setAssistant({
                ...assistant,
                chat_content: [
                    ...assistant.chat_content,
                    ...problem,
                    ...res.data
                ]
            }))
        })
    }
    return <div
            className={classNames({
                [styles.container]: true,
                [styles.isOpen]: isOpen,
            })}
    >
        <div className={styles.content}>
            <ChatBox messageList={assistant.chat_content} />
            <SendBox inputValue={inputValue} setInputValue={setInputValue} onSendMessage={onSendMessage} isLoading={isLoading} />
            <OpenButton isOpen={isOpen} setIsOpen={setIsOpen}/>
        </div>
    </div>
}

export default Assistant;

const ChatBox = (props: { messageList: chatContentType }) => {
    const { messageList = [] } = props;
    const { profile } = useAppSelector(state => state.rootReducer.userReducer.value);
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        // messageList更新时滚动到最下方
        if(!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messageList]);
    return <div
        className={styles.ChatContainer}
        ref={scrollRef}
    >
        {messageList && messageList.map((item, index) => {
            const { role, content } = item;
            const profileUrl = role === 'user' ? profile : 'https://visionary-1305469650.cos.ap-beijing.myqcloud.com/profile/logo.svg';
            return <div key={index} className={styles.messageItem}>
                <span
                    className={styles.profile}
                >
                    {profileUrl && <Image src={profileUrl} alt='' width={50} height={50} />}
                </span>
                <span className={styles.message}><MyReactMarkdown>{content}</MyReactMarkdown></span>
            </div>
        })}
    </div>
}

const OpenButton = (props: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const {isOpen, setIsOpen} = props;
    const buttonRef = useRef<HTMLDivElement>(null);
    return <Tooltip
        title={'写作助手'}
        placement={'left'}
        getPopupContainer={() => buttonRef.current || document.body}
    >
        <span
            ref={buttonRef}
            className={styles.openButton}
            onClick={() => {
                setIsOpen(!isOpen);
            }}
        >
            <IconFont
                type={isOpen ? 'icon-rightArrow' : 'icon-leftArrow'}
            />
        </span>
    </Tooltip>
}

const SendBox = (props: { inputValue: string, setInputValue: Dispatch<SetStateAction<string>>, onSendMessage: () => void, isLoading: boolean }) => {
    const { inputValue, setInputValue, onSendMessage, isLoading } = props;
    const [isFocus, setIsFocus] = useState(false);
    const [placeholder, setPlaceholder] = useState('');
    useEffect(() => {
        // 依赖判断系统的渲染要放在客户端挂载后做，不然会出现SSR和水合不匹配的问题
        const userAgent = navigator.userAgent;
        let shortcutKey = '';
        if (userAgent.indexOf('Windows')!== -1) {
            shortcutKey = 'shift'
        } else if (userAgent.indexOf('Macintosh')!== -1 || userAgent.indexOf('Mac OS')!== -1) {
            shortcutKey = 'cmd'
        } else {
            shortcutKey = '';
        }
        setPlaceholder(`通过${shortcutKey}+回车换行；`);
    }, []);
    return <div
        className={classNames({
            [styles.sendContainer]: true,
            [styles.isFocus]: isFocus,
        })}
    >
        <Input.TextArea
            value={inputValue}
            onFocus={() => {
                setIsFocus(true);
            }}
            onBlur={() => {
                setIsFocus(false);
            }}
            style={{height: 120, resize: 'none'}}
            placeholder={placeholder}
            onChange={(e) => {
                setInputValue(e.target.value);
            }}
        />
        <div
            className={styles.bottom}
        >
            <Button
                onClick={onSendMessage}
                type="primary"
                disabled={isLoading}
                loading={isLoading}
            >
                {!isLoading && <IconFont type={'icon-fasong'} />}
            </Button>
        </div>
    </div>
}