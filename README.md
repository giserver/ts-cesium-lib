# jas-cesium-libs

[![npm](https://img.shields.io/npm/v/jas-cesium-libs)](https://www.npmjs.com/package/jas-cesium-libs)

项目旨在对cesium常用功能`无侵入`、`模块化`封装，避免不同开发框架下徒劳增加学习成本

## 功能

- [标记](./src/libs/Mark.ts)

    - 支持点、线、面的绘制
    - 支持颜色、线性修改
    - 支持开启\关闭测量模式

- [镜像](./src/libs/Mirror.ts)
- [自转](./src/libs/SelfSpin.ts)
- [动态抽稀](./src/libs/Thinning.ts)

    - 支持自定义抽稀系数
    - 支持自定义抽稀实体获取回调

- [天气](./src/libs/Weather.ts)

    - 支持雪天、雨天、雾天

- [选择实体](./src/libs/EntityPicker.ts)
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

- 将`./src/lib`文件夹或者其中一个文件拷贝至项目中即可