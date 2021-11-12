import { Cartesian3, Cesium3DTileset, Color, LabelGraphics, Viewer } from "cesium";
import { SpaceType } from ".";

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

    viewer.resolutionScale = window.devicePixelRatio;

    //是否开启抗锯齿
    viewer.postProcessStages.fxaa.enabled = false;
    viewer.scene.postProcessStages.fxaa.enabled = false;
    return viewer;
}

/**
 * 设置镜头最大俯仰角，镜头朝下=-Π  镜头平视=0
 *
 * @export
 * @param {Viewer} viewer
 * @param {number} maxPitch 一般使用负数，-pi ~ 0
 */
export function setMaxPitch(viewer: Viewer, maxPitch: number) {
    var globe = viewer.scene.globe;
    var camera = viewer.scene.camera;

    var scratchNormal = new Cartesian3();
    var previousPosition = new Cartesian3();
    var previousDirection = new Cartesian3();
    var previousUp = new Cartesian3();
    var previousRight = new Cartesian3();

    viewer.scene.postUpdate.addEventListener(function () {
        var normal = globe.ellipsoid.geodeticSurfaceNormal(
            camera.position,
            scratchNormal
        );

        var dotProduct = Cartesian3.dot(camera.direction, normal);

        if (dotProduct >= maxPitch) {
            camera.position = Cartesian3.clone(previousPosition, camera.position);
            camera.direction = Cartesian3.clone(previousDirection, camera.direction);
            camera.up = Cartesian3.clone(previousUp, camera.up);
            camera.right = Cartesian3.clone(previousRight, camera.right);
        } else {
            previousPosition = Cartesian3.clone(camera.position, previousPosition);
            previousDirection = Cartesian3.clone(camera.direction, previousDirection);
            previousUp = Cartesian3.clone(camera.up, previousUp);
            previousRight = Cartesian3.clone(camera.right, previousRight);
        }
    });
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
* 创建cesium lable对象 ，统一样式
*
* @private
* @param {string} text lable显示文字
* @return {*}
* @memberof Mark
*/
export function createLabel(text: string): LabelGraphics {
    return new LabelGraphics({
        text: text,
        font: 'normal 48px MicroSoft YaHei',
        scale: 0.25,
        showBackground: true, // 是否显示背景颜色
        backgroundColor: new Color(0, 0, 0, 0.5),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
    })
}



/**
 * 屏幕点转化为投影坐标
 *
 * @export
 * @param {Viewer} viewer
 * @param {*} point
 * @return {*}  {(Cartesian3 | undefined)}
 */
export function window2Proj(viewer: Viewer, point: any): Cartesian3 | undefined {
    const primitives = viewer.scene.primitives;
    let has3Dtiles = false;
    for (let i = 0; i < primitives.length; i++) {
        has3Dtiles = primitives.get(i) instanceof Cesium3DTileset;
        if (has3Dtiles) break;
    }

    if (viewer.scene.terrainProvider.constructor.name == "EllipsoidTerrainProvider" && !has3Dtiles) {
        return viewer.camera.pickEllipsoid(point, viewer.scene.globe.ellipsoid);
    } else {
        return viewer.scene.pickPosition(point);
    }
}


/**
 * 计算面积 todo : 修改points类型
 *
 * @protected
 * @param {Cartesian3[]} points 多边形点
 * @return {number}  面积
 * @memberof FeatureBase
 */
export function calArea(points: Cartesian3[]): number {
    let area = 0;

    if (points.length > 2) {
        for (let i = 0; i < points.length; i++) {

            let currentPoint = points[i];
            let nextPoint = i == points.length - 1 ? points[0] : points[i + 1];

            area += currentPoint.x * nextPoint.y - currentPoint.y * nextPoint.x;
        }
    }

    return Math.abs(area);
}


/**
 * 计算线段长度 (根据空间类型)
 *
 * @export
 * @param {[Cartesian3, Cartesian3]} segmentPoints
 * @param {SpaceType} [spaceType='D3']
 * @return {*}  {number}
 */
export function calLength(segmentPoints: [Cartesian3, Cartesian3], spaceType: SpaceType = 'D3'): number {

    let start = segmentPoints[0];
    let end = segmentPoints[1];

    if (spaceType == 'H')
        return Math.abs(start.z - end.z);

    let temp = Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2);

    if (spaceType == 'D3')
        temp += Math.pow(start.z - end.z, 2);

    return Math.sqrt(temp);
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