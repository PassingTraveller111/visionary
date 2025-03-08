"use client"
import {Button, Input, Tooltip} from "antd";
import {apiClient, apiList} from "@/clientApi";
import styles from './index.module.scss';
import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import {messageType} from "@/app/api/protected/ai/test/route";
import MyReactMarkdown from "@/components/ReactMarkdown";
import classNames from "classnames";
import {IconFont} from "@/components/IconFont";
import {useAppSelector} from "@/store";
import Image from "next/image";
import {chatContentType} from "@/app/api/sql/type";


const Assistant = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [messageList, setMessageList] = useState<messageType[]>([
        {
            role: 'assistant',
            content: '你好，我是写作助手',
        },
        {
            role: 'user',
            content: '以下是一段涵盖多种 Markdown 元素的测试文本，你可以使用它来测试 Markdown 解析器、编辑器等工具的功能\n' +
                '\n' +
                '## latex公式测试\n' +
                '行内公式\n' +
                '$ \\int_{a}^{b} f(x) dx $\n' +
                '\n' +
                '块级公式\n' +
                '$$\n' +
                '\\int_{a}^{b} f(x) dx\n' +
                '$$\n' +
                '\n' +
                '## 标题测试\n' +
                '\n' +
                '### 三级标题\n' +
                '#### 四级标题\n' +
                '##### 五级标题\n' +
                '###### 六级标题\n' +
                '\n' +
                '## 段落测试\n' +
                '这是一个普通的段落文本。Markdown 中，段落是通过换行来分隔的。连续的文本行会被视为同一个段落。\n' +
                '\n' +
                '这是另一个段落，它和上一个段落通过空行分隔。\n' +
                '\n' +
                '## 列表测试\n' +
                '\n' +
                '### 无序列表\n' +
                '- 无序列表项 1\n' +
                '- 无序列表项 2\n' +
                '  - 嵌套无序列表项 2.1\n' +
                '  - 嵌套无序列表项 2.2\n' +
                '- 无序列表项 3\n' +
                '\n' +
                '### 有序列表\n' +
                '1. 有序列表项 1\n' +
                '2. 有序列表项 2\n' +
                '   1. 嵌套有序列表项 2.1\n' +
                '   2. 嵌套有序列表项 2.2\n' +
                '3. 有序列表项 3\n' +
                '\n' +
                '## 引用测试\n' +
                '> 这是一个块引用。块引用通常用于引用他人的话语或段落。\n' +
                '> \n' +
                '> 可以有多行引用内容。\n' +
                '>> 还可以进行嵌套引用。\n' +
                '\n' +
                '## 代码测试\n' +
                '\n' +
                '### 行内代码\n' +
                '在 Markdown 中，可以使用反引号 ` 来表示行内代码，例如 `const message = \'Hello, World!\';`。\n' +
                '\n' +
                '### 代码块\n' +
                '使用三个反引号 ``` 或四个空格缩进可以创建代码块。以下是一个 JavaScript 代码块的示例：\n' +
                '```javascript\n' +
                'function greet(name) {\n' +
                '    return `Hello, ${name}!`;\n' +
                '}\n' +
                '\n' +
                'const person = \'Alice\';\n' +
                'console.log(greet(person));\n' +
                '```\n' +
                '\n' +
                '## 链接测试\n' +
                '- [这是一个外部链接](https://www.example.com)\n' +
                '- [这是一个内部链接](#标题测试)\n' +
                '\n' +
                '## 图片测试\n' +
                '![](https://visionary-1305469650.cos.ap-beijing.myqcloud.com/article/1/1740226399250-profile.png)\n' +
                '\n' +
                '## 强调测试\n' +
                '- *斜体文本* 使用单个星号或下划线包围。\n' +
                '- **粗体文本** 使用两个星号或下划线包围。\n' +
                '- ***粗斜体文本*** 使用三个星号或下划线包围。\n' +
                '- ~~删除线文本~~ 使用两个波浪线包围。\n' +
                '\n' +
                '## 表格测试\n' +
                '| 表头 1 | 表头 2 | 表头 3 |\n' +
                '| ------ | ------ | ------ |\n' +
                '| 单元格 1 | 单元格 2 | 单元格 3 |\n' +
                '| 单元格 4 | 单元格 5 | 单元格 6 |\n' +
                '\n' +
                '## 分割线测试\n' +
                '可以使用三个或更多的连字符 `---`、星号 `***` 或下划线 `___` 来创建分割线。\n' +
                '\n' +
                '---\n' +
                '***\n' +
                '___'
        }
    ]);
    const assistant = useAppSelector(state => state.rootReducer.assistantReducer.value);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const onClick = () => {
        console.log(inputValue);
        if (inputValue === '') return;
        const newMessageList: messageType[] = [
            ...messageList,
            {
                role: 'user',
                content: inputValue,
            }
        ]
        setMessageList(newMessageList);
        setInputValue('');
        apiClient(apiList.post.protected.ai.test, {
            method: 'POST',
            body: JSON.stringify({
                messages: newMessageList,
            }),
        }).then(res => {
            console.log(res.data.choices);
            const messages = res.data.choices.map((item: { message: messageType }) => {
                return item.message;
            })
            setMessageList([
                ...newMessageList,
                ...messages,
            ]);
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
            <SendBox inputValue={inputValue} setInputValue={setInputValue} sendMessage={onClick}/>
            <OpenButton isOpen={isOpen} setIsOpen={setIsOpen}/>
        </div>
    </div>
}

export default Assistant;

const ChatBox = (props: { messageList: chatContentType }) => {
    const { messageList = [] } = props;
    const { profile } = useAppSelector(state => state.rootReducer.userReducer.value);
    return <div className={styles.ChatContainer}>
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

const SendBox = (props: { inputValue: string, setInputValue: Dispatch<SetStateAction<string>>, sendMessage: () => void }) => {
    const { inputValue, setInputValue, sendMessage } = props;
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
            maxLength={1000}
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
                onClick={sendMessage}
                type="primary"
            >
                <IconFont type={'icon-fasong'} />
            </Button>
        </div>
    </div>
}