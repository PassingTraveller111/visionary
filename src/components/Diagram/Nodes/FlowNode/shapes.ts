


export type ShapeType = {
    d: string, // svg的路径
    title: string, // 图形名称
    width?: number, // 宽度
    height?: number, // 高度
    stroke?: string, // 默认的线条颜色
    strokeWidth?: number, // 默认的线条宽度
    fill?: string, // 默认的填充颜色
}

export const Shapes: {
    [key: string]: {
        [key: string]: ShapeType,
    }
} = {
    // 基础图形
    Base: {
        Hexagon: {
            d: 'M50,0 L100,33.3 L100,66.6 L50,100 L0,66.6 L0,33.3 Z',
            title: '六边形',
            width: 120,
            height: 120,
        },
        Triangle: {
            d: 'M50,0 L100,100 L0,100 Z',
            title: '矩形',
            width: 120,
            height: 60,
        },
        Rectangle: {
            d: 'M0,0 V100 H100 V0 Z',
            title: '三角形',
            width: 120,
            height: 60,
        },
        Circle: {
            d: 'M50,0 A50,50 0 1,1 50,100 A50,50 0 1,1 50,0 Z',
            title: '圆形',
            width: 120,
            height: 120,
        },
    },
    // 流程图
    Flow: {
        StartEnd: {
            d: 'M10,0 Q-10,50 10,100 L90,100 Q110,50 90,0  Z',
            title: '开始/结束',
            width: 120,
            height: 60,
        }
    }
}