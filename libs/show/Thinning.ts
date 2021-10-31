import { Cartesian2, defined, EllipsoidGeodesic, Entity, JulianDate, ScreenSpaceEventType, Viewer } from "cesium";
import { FeatureBase } from "..";

/**
 * 抽稀
 *
 * @export
 * @class Thinning
 * @extends {FeatureBase}
 */
export default class Thinning extends FeatureBase {


    /**
     * 获取点函数
     *
     * @private
     * @memberof Thinning
     */
    private pointsFunc: ((viewer: Viewer) => Array<Entity>) | undefined;

    /**
     * x方向 (东方向) 抽稀系数
     *
     * @private
     * @type {number}
     * @memberof Thinning
     */
    private x: number = 0;

    /**
     * y方向 (西方向) 抽稀系数
     *
     * @private
     * @type {number}
     * @memberof Thinning
     */
    private y: number = 0;

    constructor(viewer: Viewer) {
        super(viewer);
    }


    /**
     * 设置抽稀点获取函数
     *
     * @param {(viewer: Viewer) => Array<Entity>} pointsFunc
     * @return {*} 
     * @memberof Thinning
     */
    setPointsFunc(pointsFunc: (viewer: Viewer) => Array<Entity>): Thinning {
        this.pointsFunc = pointsFunc;
        return this;
    }

    /**
     * 设置xy抽稀系数
     *
     * @param {number} x
     * @param {number} y
     * @return {*} 
     * @memberof Thinning
     */
    setLimitXY(x: number, y: number): Thinning {
        this.x = x;
        this.y = y;
        return this;
    }

    /**
     * 运行抽稀
     *
     * @memberof Thinning
     */
    start() {
        this.calThinning();
        this.viewer.screenSpaceEventHandler.setInputAction(e => {
            this.calThinning();
        }, ScreenSpaceEventType.WHEEL)
    }

    /**
     * 停止抽稀
     *
     * @memberof Thinning
     */
    clear(): void {
        if (this.pointsFunc)
            this.pointsFunc(this.viewer).forEach(entity => entity.show = true);

        this.viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.WHEEL);

        if (this.pointsFunc)
            this.pointsFunc = undefined;

        this.x = 0;
        this.y = 0;
    }

    private calThinning() {
        // 获取抽稀点
        if (this.pointsFunc === undefined) return;
        let points = this.pointsFunc(this.viewer);

        // 获取空间屏幕分辨率
        let geoRES = this.calGeoRES();
        if (geoRES === null) return;

        //获取点范围
        let extent = this.calExtent(points);
        if (extent === null) return;

        let xGES = geoRES * this.x;
        let yGES = geoRES * this.y;
        const { xMin, yMin, xMax, yMax } = extent;
        let hitMap = new Array<Array<Entity>>();

        /*     xGES                               (xmax,ymax)
            +  +  +  +  +  +  +  +  +  +  +  +  +
       yGES +        +  p5    +        +  p4    +
            +        +        +        +        +
            +  +  +  +  +  +  +  +  +  +  +  +  +
            +  p9    +        + p2     +        +
            +        +        + p7(out)+        +
            +  +  +  +  +  +  +  +  +  +  +  +  +
            +        + p1     +        + p3     +
            +        +p10(out)+        +        +
            +  +  +  +  +  +  +  +  +  +  +  +  +
            +  p6    +        +  p8    +        +
            +        +        +        +        +
            +  +  +  +  +  +  +  +  +  +  +  +  +
 (xmin,ymin)
        */
        points.forEach(point => {
            if (point.position) {
                let xy = point.position.getValue(JulianDate.now());
                let i = Math.round((xy.x - xMin) / xGES);
                let j = Math.round((xy.y - yMin) / yGES);

                if (hitMap[i] == undefined)
                    hitMap[i] = new Array<Entity>();

                if (hitMap[i][j])
                    point.show = false;
                else {
                    hitMap[i][j] = point;
                    point.show = true;
                }

            }
        })
    }

    /**
     * 计算地理分辨率 当前相机层级1px代表的地理长度 
     *
     * @private
     * @return {*} 
     * @memberof Thinning
     */
    private calGeoRES(): number | null {
        let scene = this.viewer.scene;
        // 获取画布的大小
        let width = scene.canvas.clientWidth;
        let height = scene.canvas.clientHeight;
        //获取画布中心两个像素的坐标（默认地图渲染在画布中心位置）
        let left = scene.camera.getPickRay(new Cartesian2((width / 2) | 0, (height - 1) / 2));
        let right = scene.camera.getPickRay(new Cartesian2(1 + (width / 2) | 0, (height - 1) / 2));

        let globe = scene.globe;
        let leftPosition = globe.pick(left, scene);
        let rightPosition = globe.pick(right, scene);

        if (!defined(leftPosition) || !defined(rightPosition) || !leftPosition || !rightPosition) {
            return null;
        }

        let leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
        let rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);
        let geodesic = new EllipsoidGeodesic();
        geodesic.setEndPoints(leftCartographic, rightCartographic);

        return geodesic.surfaceDistance;//分辨率
    }

    /**
     * 计算当前点范围
     *
     * @private
     * @param {Array<Entity>} points
     * @return {*}
     * @memberof Thinning
     */
    private calExtent(points: Array<Entity>): { xMin: number, yMin: number, xMax: number, yMax: number } | null {
        if (!points || points.length < 1)
            return null;

        let xMin = Number.MAX_VALUE;
        let yMin = Number.MAX_VALUE;
        let xMax = Number.MIN_VALUE;
        let yMax = Number.MIN_VALUE;

        points.forEach(point => {
            if (point.position) {
                let xy = point.position.getValue(JulianDate.now());
                xMin = Math.min(xMin, xy.x);
                yMin = Math.min(yMin, xy.y);
                xMax = Math.max(xMax, xy.x);
                yMax = Math.max(yMax, xy.y);
            }
        })

        return { xMin, yMin, xMax, yMax };
    }

}