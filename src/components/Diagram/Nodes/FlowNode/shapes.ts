


export type ShapeType = {
    d: string, // svg的路径
    title: string, // 图形名称
    width?: number, // 宽度
    height?: number, // 高度
    stroke?: string, // 默认的线条颜色
    strokeWidth?: number, // 默认的线条宽度
    fill?: string, // 默认的填充颜色
    icon?: string, // 图标
}

export const Shapes: {
    [key: string]: {
        [key: string]: ShapeType,
    }
} = {
    // 基础图形
    Base: {
        Text: {
          d: '',
          title: '文本',
          width: 120,
          height: 60,
          icon: 'https://visionary-1305469650.cos.ap-beijing.myqcloud.com/diagram_shape_icon/text.png',
        },
        Hexagon: {
            d: 'M50,0 L100,33.3 L100,66.6 L50,100 L0,66.6 L0,33.3 Z',
            title: '六边形',
            width: 120,
            height: 120,
        },
        Triangle: {
            d: 'M50,0 L100,100 L0,100 Z',
            title: '三角形',
            width: 120,
            height: 60,
        },
        Rectangle: {
            d: 'M0,0 V100 H100 V0 Z',
            title: '矩形',
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
        },
        Flow: {
            d: 'M0,0 V100 H100 V0 Z',
            title: '流程',
            width: 120,
            height: 60,
        },
        Judge: {
            d: 'M50,0 L100,50 L50,100 L0,50 Z',
            title: '判定',
            width: 120,
            height: 60,
        },
        Document: {
            d: 'M0,0 L0,90 Q25,110 50,90 Q75,80 100,90 L100,0 Z',
            title: '文档',
            width: 120,
            height: 60,
        },
        Data: {
            d: 'M40,0 L100,0 L60,100 L0,100 Z',
            title: '数据',
            width: 120,
            height: 60,
        },
        ChildFlow: {
            d: 'M0,0 L0,100 L100,100 L100,0 L20,0 L20,100 L80,100 L80,0 Z',
            title: '子流程',
            width: 120,
            height: 60,
        },
        outerData: {
            d: 'M10,0 Q-10,50 10,100 L100,100 Q90,50 100,0 Z',
            title: '外部数据',
            width: 120,
            height: 60,
        },
        DataBase: {
            d: 'M90,0 Q80,50 90,100 Q100,50 90,0 L10,0 Q0,50 10,100 L90,100',
            title: '数据库',
            width: 120,
            height: 60,
        },
    }
}