import { Cartesian3, Color, LabelGraphics, Viewer } from "cesium";
import { CursorStyle, SpaceType } from '.'

/**
 * cesium 功能类的基类，提供公共的接口
 *
 * @export
 * @class FeatureBase
 */
export default abstract class FeatureBase {

    protected viewer: Viewer;

    constructor(viewer: Viewer) {
        this.viewer = viewer;
    }

    /**
     * 清除
     *
     * @abstract
     * @memberof FeatureBase
     */
    abstract clear(): void;

    /**
     * 设置指针样式
     *
     * @param {CursorStyle} cursorStyle 指针类型
     * @memberof FeatureBase
     */
    protected setCursorStyle(cursorStyle: CursorStyle) {
        this.viewer.container.setAttribute("style", `cursor:${CursorStyle[cursorStyle]}`)
    }

    /**
    * 创建cesium lable对象 ，统一样式
    *
    * @private
    * @param {string} text lable显示文字
    * @return {*}
    * @memberof Mark
    */
    createLabel(text: string): LabelGraphics {
        return new LabelGraphics({
            text: text,
            font: '10px Consolas',
            showBackground: true, // 是否显示背景颜色
            backgroundColor: new Color(0, 0, 0, 0.5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        })
    }


    /**
     * 计算面积 todo : 修改points类型
     *
     * @protected
     * @param {Cartesian3[]} points 多边形点
     * @return {number}  面积
     * @memberof FeatureBase
     */
    protected calArea(points: Cartesian3[]): number {
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
     * 计算长度 (根据空间类型)
     *
     * @protected
     * @param {[Cartesian3,Cartesian3]} segmentPoints 线段点 起始点->终止点
     * @param {SpaceType} [spaceType=SpaceType.D3] 空间类型 3D 2D 高度
     * @return {number}  长度
     * @memberof FeatureBase
     */
    protected calLength(segmentPoints: [Cartesian3, Cartesian3], spaceType: SpaceType = SpaceType.D3): number {

        let start = segmentPoints[0];
        let end = segmentPoints[1];

        if (spaceType == SpaceType.H)
            return Math.abs(start.z - end.z);

        let temp = Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2);

        if (spaceType == SpaceType.D3)
            temp += Math.pow(start.z - end.z, 2);

        return Math.sqrt(temp);
    }
}