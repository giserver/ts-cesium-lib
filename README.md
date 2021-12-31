# jas-cesium-libs

[![npm](https://img.shields.io/npm/v/jas-cesium-libs)](https://www.npmjs.com/package/jas-cesium-libs)

项目旨在对cesium常用功能`无侵入`、`模块化`封装，避免不同开发框架下徒劳增加学习成本

## 功能

- [标记](./libs/editor/Marker.ts)

    - 支持点、线、面的绘制
    - 支持颜色、线性修改
    - 支持开启\关闭测量模式

- [镜像](./libs/show/Mirror.ts)
- [自转](./libs/show/SelfSpin.ts)
- [动态抽稀](./libs/show/Thinning.ts)

    - 支持自定义抽稀系数
    - 支持自定义抽稀实体获取回调

- [天气](./libs/show/Weather.ts)

    - 支持雪天、雨天、雾天

- [选择实体](./libs/show/EntityPicker.ts)
- 开发中 ...

## 使用

### demo 运行

``` bash

git clone https://github.com/cocaine-coder/ts-cesium-demo.git

cd ts-cesium-demo

yarn # 或者 npm install

yarn dev # 或者 npm run dev

```

### 在其他项目中使用功能

- 项目安装[cesium](https://github.com/CesiumGS/cesium)库，确保支持ES6语法

- 使用npm or yarn 安装 jas-cesium-libs 库

- 本项目不支持自动打包cesium，推荐使用vite作为项目构建工具，配合vite-plugin-cesium

- vite 具体配置 [vite.config.ts](./vite.config.ts)

## api 使用

- `工具篇`

``` ts
import {createViewer,setMaxPitch,removeEntityByName,window2Proj} from 'jas-cesium-libs'

// 快速创建一个无官方控件的地球
const viewer = createViewer("{{div-id}}");

// 设置镜头最大仰角
setMaxPitch(viewer, -0.3);

// 根据实体名 删除viewer.entities 中的元素
// 注 ：之后修改为 EntityCollection 替换 Viewer 类型
removeEntityByName(viewer,"{{entity-name}}");

// 屏幕点转化为投影坐标
const point = {x:1,y:2};
window2Proj(viewer,point);
```

- `标记功能`

``` ts
import {createViewer, Marker} from 'jas-cesium-libs'

// 快速创建一个无官方控件的地球
const viewer = createViewer("{{div-id}}");

// 创建标记功能
const marker = new Marker(viewer); // or : new Marker(viewer,entity=>complete(entity));

// 修改样式
marker.style.point_Color = "#ffff00";

// 开始标记 可重复使用
marker.start('Point'); // or : .start('Line');  .start('Polygon');

// 结束标记
marker.stop();

```

- `镜像`

``` ts
import {createViewer, Mirror} from 'jas-cesium-libs'

// 快速创建一个无官方控件的地球
const viewer_master = createViewer("{{div-id-master}}");
const viewer_slave = createViewer("{{div-id-slave}}");

// 创建镜像
const mirror = new Mirror(viewer_master,viewer_slave); // or : new Mirror("{{div-id-master}}","{{div-id-slave}}");

// 获取左右两个viewer
const {master1,slave1} = this.getViewers();
```