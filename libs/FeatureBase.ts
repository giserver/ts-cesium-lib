import { Viewer } from "cesium";
import { CursorStyle } from ".";

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
     * 设置指针样式
     *
     * @protected
     * @param {CursorStyle} cursorStyle
     * @memberof FeatureBase
     */
    protected setCursorStyle(cursorStyle: CursorStyle) {
        this.viewer.container.setAttribute("style", `cursor:${cursorStyle}`)
    }
}