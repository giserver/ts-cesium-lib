import { ShapeType } from "../../libs";

interface RouterGroup {
    title: RouterGroupTitle,
    items: Array<RouterGroupItem>
}

interface RouterGroupTitle {
    name: string;
    icon: string;
}

interface RouterGroupItem {
    name: string;
    href: string;
}

interface RadioOption<T> {
    name: string,
    label: T
}

export const routerGroups: Array<RouterGroup> = [{
    title: {
        name: "地图加载",
        icon: "el-icon-picture"
    },
    items: [
        {
            name: "相机限制",
            href: "/limitcamera"
        },
        {
            name: "底图加载",
            href: "/map"
        },
        {
            name: "双屏对比",
            href: '/mirror'
        }
    ]
}, {
    title: {
        name: "编辑功能",
        icon: "el-icon-edit"
    },
    items: [
        {
            name: "点线面绘制",
            href: "/marker"
        }
    ]
}, {
    title: {
        name: "数据模块",
        icon: "el-icon-data-line"
    },
    items: [
        {
            name: "展示",
            href: "/datashow"
        },
        {
            name: "导入/导出",
            href: "/"
        },
        {
            name: "统计",
            href: '/'
        }
    ]
}]

export type MapProvider = 'amap' | 'bdmap' | 'custom' | 'mapbox' | '3dtiles';

export const mapRadioOptions: Array<RadioOption<MapProvider>> = [
    {
        name: "高德地图",
        label: "amap",
    },
    {
        name: "百度地图",
        label: "bdmap",
    },
    {
        name: "自定义",
        label: "custom",
    },
    {
        name: "倾斜摄影",
        label: "3dtiles"
    },
    {
        name: "mapbox",
        label: "mapbox",
    },
]

export const markerRadioOptions: Array<RadioOption<ShapeType>> = [
    {
        name: '点',
        label: 'Point'
    }, 
    {
        name: '线',
        label: 'Line'
    },
    {
        name: '面',
        label: 'Polygon'
    }
]