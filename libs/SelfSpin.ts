import { Cartesian3, Viewer } from "cesium";
import FeatureBase from "./FeatureBase";

export default class SelfSpin extends FeatureBase {

    /**
     * 自转执行方法(内部使用)
     *
     * @private
     * @memberof SelfSpin
     */
    private declare rotateAction: () => void;

    constructor(viewer: Viewer) {
        super(viewer);
    }

    /**
     * 地球自转
     *
     * @param {number} rotateSpeed
     * @memberof CesiumDataStore
     */
    start(rotateSpeed: number = 0.018) {
        this.rotateAction = () => {
            this.viewer.scene.camera.rotate(Cartesian3.UNIT_Z, -(.1) * rotateSpeed);
        };

        this.stop(); //防止多次添加事件
        this.viewer.clock.onTick.addEventListener(this.rotateAction);
    }

    /**
     * 移除地球自转
     *
     * @memberof CesiumDataStore
     */
    stop() {
        try { //clock maybe throw error in viewer
            this.viewer.clock.onTick.removeEventListener(this.rotateAction);
        } catch (error) {
            //console.error(error)
        }
    }

    clear(): void {
        this.stop();
    }
}