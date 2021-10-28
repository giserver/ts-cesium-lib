import { MapboxStyleImageryProvider, Viewer } from "cesium";

/**
 * 创建 viewer
 *
 * @export
 * @param {string} containerName div容器 id
 * @return {*}  {Viewer}
 */
export function createViewer(containerName: string): Viewer {
    let viewer = new Viewer(containerName, {
        animation: false,    //左下角的动画仪表盘
        baseLayerPicker: false,  //右上角的图层选择按钮
        geocoder: false,  //搜索框
        homeButton: false,  //home按钮
        sceneModePicker: false, //模式切换按钮
        timeline: false,    //底部的时间轴
        navigationHelpButton: false,  //右上角的帮助按钮，
        fullscreenButton: false,   //右下角的全屏按钮
        infoBox: false,
        vrButton: false,
        selectionIndicator: false,
        creditContainer: document.createElement('div') //logo 图标
    })

    viewer.scene.skyBox.show = false;
    return viewer;
}

/**
 * 通过entity的名字删除entity
 *
 * @param {Viewer} viewer
 * @param {string} name
 */
export function removeEntityByName(viewer: Viewer, name: string) {
    for (let index = viewer.entities.values.length - 1; index > -1; index--) {
        let entity = viewer.entities.values[index];
        if (entity.name === name)
            viewer.entities.remove(entity);
    }
}

/**
  * 数组添加方法监听
  *
  * @private
  * @template T any
  * @param {Array<T>} array 数组
  * @param {arrayMethodName} methodName 方法类型
  * @param {(value: T) => void} callback
  * @memberof Mark
  */
export function addArrayListener<T>(array: Array<T>, methodName: keyof T[], callback: (array: Array<T>, args: IArguments) => void) {

    if (methodName === "length") return;

    // 获取Array的原型，并创建一个新的对象指向这个原型
    const arrayMethods = Object.create(Array.prototype)

    // 重新构建Array原型里面的虽有方法
    Object.getOwnPropertyNames(Array.prototype).forEach(method => {

        if (typeof arrayMethods[method] === "function" && method === methodName) {
            array[methodName] = function () {
                callback(this, arguments);
                return arrayMethods[method].apply(this, arguments)
            }
        }
    })

}