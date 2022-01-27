# jas-cesium-libs

[![npm](https://img.shields.io/npm/v/jas-cesium-libs)](https://www.npmjs.com/package/jas-cesium-libs)

项目旨在对cesium常用功能`无侵入`、`模块化`封装，避免不同开发框架下徒劳增加学习成本

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

- `基础`

``` ts
import {createViewer,setMaxPitch,removeEntityByName,window2Proj} from 'jas-cesium-libs'

// 快速创建一个无官方控件的地球
const viewer = createViewer("{{div-id}}");

// 设置镜头最大仰角
setMaxPitch(viewer, -0.3);

// 根据实体名 删除viewer.entities 中的元素
// 注 ：之后修改为 EntityCollection 替换 Viewer 类型
removeEntityByName(viewer.entities ,"{{entity-name}}");

// 屏幕点转化为投影坐标
const point = {x:1,y:2};
window2Proj(viewer,point);
```

- `标记`

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

- `测量`

    *用法和标记功能类似，都实现了[Editor](./libs/editor/Editor.ts)抽象类*
``` ts
import {createViewer, Measurer} from 'jas-cesium-libs'

const viewer = createViewer("{{div-id}}");
const measurer = new Measurer(viewer);

// 修改样式
marker.style.point_Color = "#ffff00";
marker.start('Point'); // or : .start('Line');  .start('Polygon');
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
const {master,slave} = this.getViewers();
```

- `选择Entity`

``` ts
import {createViewer, EntityPicker} from 'jas-cesium-libs'

const viewer = createViewer("{{div-id}}");
const picker = new EntityPicker(viewer);
picker.start((entity, position) => {
    // todo whth entity or position
});

```

- `popup 弹出框`

    *需要配合 EntityPicker 使用*

``` ts
import {createViewer, Popup, EntityPicker} from 'jas-cesium-libs'

const viewer = createViewer("{{div-id}}");
const picker = new EntityPicker(viewer);

// 创建弹出框 默认使用模板内置模板嵌套
// 如果在外层自定义封装popup div样式，则自行挂载popup关闭事件，执行picker.close();
const popup = new Popup(viewer);
picker.start((entity, position) => {
    const element = document.createElement("div");
    element.innerHTML = parseData2Html(entity.properties?.getValue(JulianDate.now()));
    popup.show(position, element);
});

function parseData2Html(data: any) {
    return `<div>名称 : ${data.name}</div>
            <div>描述 : ${data.description}</div>
            <div>数量 : ${data.count}</div>
            <div>类型 : ${data.type}</div>
            <div>建成时间 : ${data.create_time}</div>
            <div>高度 : ${data.height}</div>
            <div>需要重建 : ${data.need_rebuild}</div>`
```

- `entity 抽稀`

    *用于渲染lable或其他地理描述展示时，对数据进行抽稀防止重叠看不清*

``` ts
import {createViewer, Thinning} from 'jas-cesium-libs'

const viewer = createViewer("{{div-id}}");
let thinning = new Thinning()
    .setPointsFunc(viewer=>viewer.entities)
    .setLimitXY(15,15)
    .start();

// 停止抽稀
// thinning.clear();
```