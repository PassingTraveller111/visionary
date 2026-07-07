"use client"
import { useState, useRef, useEffect, useCallback } from 'react';

// 单个列表项组件 - 固定高度50px
const ListItem = ({ index, data }: { index: number, data: string}) => {
    return (
        <div
            className="list-item"
            style={{ height: '50px', lineHeight: '50px', borderBottom: '1px solid #eee', padding: '0 10px' }}
        >
            第{index + 1}条数据 - {data}
        </div>
    );
};

type VirtualListProps = {
    dataList: dataListType
}
type dataListType = {
    id: number;
    content: string;
}[]

// 核心：虚拟列表组件
const VirtualList = ({ dataList }: VirtualListProps) => {
    // 1. 核心常量配置（可抽离成props，灵活配置）
    const ITEM_HEIGHT = 50; // 单个列表项固定高度
    const VIEWPORT_HEIGHT = 500; // 列表容器固定高度
    // 可视区域可展示数量 + 2个缓冲区，避免滚动闪烁
    const VISIBLE_COUNT = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + 2;

    // 2. 状态管理：存储当前要渲染的列表数据
    const [renderList, setRenderList] = useState<dataListType>([]);
    // 3. 容器Ref：获取真实DOM的scrollTop/clientHeight等属性
    const listContainerRef = useRef<HTMLDivElement>(null);
    // 4. 状态管理：存储空白占位高度（paddingTop）
    const [paddingTop, setPaddingTop] = useState(0);

    // 核心方法：处理滚动事件，计算所有关键参数
    const handleScroll = useCallback(() => {
        const container = listContainerRef.current;
        if (!container) return;
        const { scrollTop } = container; // 获取滚动偏移量

        // 1. 计算起始渲染索引
        const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        // 2. 计算结束渲染索引
        const endIndex = startIndex + VISIBLE_COUNT;
        // 3. 截取需要渲染的数据（核心：只渲染视口内的部分数据）
        const showList = dataList.slice(startIndex, endIndex);
        // 4. 计算空白占位高度（模拟视口上方的未渲染内容）
        const top = startIndex * ITEM_HEIGHT;

        // 更新状态：渲染数据 + 空白占位高度
        setRenderList(showList);
        setPaddingTop(top);
    }, [dataList, VISIBLE_COUNT]);

    // 初始化渲染：页面加载时，渲染第一屏数据
    useEffect(() => {
        const container = listContainerRef.current;
        if (!container) return;
        handleScroll(); // 首次执行滚动逻辑
        // 绑定滚动事件
        container.addEventListener('scroll', handleScroll);
        // 组件卸载：解绑滚动事件，避免内存泄漏
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]); // 依赖：列表数据源变化时重新初始化

    return (
        <div
            ref={listContainerRef}
            style={{
                height: `${VIEWPORT_HEIGHT}px`,
                overflow: 'auto',
                border: '1px solid #ccc',
                width: '500px',
                margin: '20px auto'
            }}
        >
            {/* 核心：滚动容器内部的列表区域 */}
            <div
                style={{
                    paddingTop: `${paddingTop}px`, // 空白占位区，模拟上方未渲染内容
                    transition: 'padding-top 0ms' // 取消过渡，避免滚动时paddingTop变化的动画卡顿
                }}
            >
                {/* 只渲染截取后的少量数据 */}
                {renderList.map((item, index) => (
                    <ListItem
                        key={item.id}
                        index={Math.floor(paddingTop / ITEM_HEIGHT) + index}
                        data={item.content}
                    />
                ))}
            </div>
        </div>
    );
};

// 页面入口组件
const App = () => {
    // 生成10000条测试数据，模拟超长列表
    const generateData = () => {
        const list = [];
        for (let i = 0; i < 10000; i++) {
            list.push({ id: i, content: `我是测试数据-${Math.random().toFixed(4)}` });
        }
        return list;
    };
    const dataList = generateData();

    return (
        <div>
            <h2 style={{ textAlign: 'center' }}>React 手写虚拟列表（10000条数据）</h2>
            <VirtualList dataList={dataList} />
        </div>
    );
};

export default App;
