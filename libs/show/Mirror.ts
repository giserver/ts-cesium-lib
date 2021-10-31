import { Camera, Viewer } from "cesium";
import { createViewer, Mark } from "..";

/**
 * 镜像功能，可以实现双屏模式
 *
 * @export
 * @class Mirror
 */
export default class Mirror {

    private master: Viewer;
    private slave: Viewer;

    private declare mark: Mark;

    /**
     * Creates an instance of Mirror.
     * @param {string} master 左侧参考viewer  标记主体
     * @param {string} slave 右侧参考viewer  跟随标记
     * @memberof Mirror
     */
    constructor(master: string | Viewer, slave: string | Viewer) {
        if (master === slave)
            throw new Error(`container is same to viewer`);

        if (typeof master === 'string')
            this.master = createViewer(master);
        else
            this.master = master;

        if (typeof slave === 'string')
            this.slave = createViewer(slave);
        else
            this.slave = slave;

        if (this.master === null || this.slave === null)
            throw new Error(`create viewer failed !`);

        this.init();
    }

    /**
     * 获取左右两个viewer
     *
     * @return {*}  {{ master: Viewer, slave: Viewer }}
     * @memberof Mirror
     */
    getViewers(): { master: Viewer, slave: Viewer } {
        return { master: this.master, slave: this.slave };
    }

    /**
     * 销毁
     *
     * @memberof Mirror
     */
    destroy() {
        this.master.destroy();
        this.slave.destroy();
    }

    /**
     * 初始化镜像功能
     *
     * @private
     * @memberof Mirror
     */
    private init() {
        const leftCamera = this.master.camera;
        const rightCamera = this.slave.camera;

        const leftMirrorHandler = this.createMirrorHandler(rightCamera, leftCamera);
        const rightMirrorHandler = this.createMirrorHandler(leftCamera, rightCamera);

        leftCamera.changed.addEventListener(rightMirrorHandler);
        this.master.scene.preRender.addEventListener(rightMirrorHandler);

        rightCamera.changed.addEventListener(leftMirrorHandler);
        this.slave.scene.preRender.addEventListener(leftMirrorHandler);
    }

    /**
     * 创建镜像Handler 实现camera同步
     *
     * @private
     * @param {Camera} masterCamera 主体相机
     * @param {Camera} slaveCamera 跟随相机
     * @return {*} 
     * @memberof Mirror
     */
    private createMirrorHandler(masterCamera: Camera, slaveCamera: Camera): () => void {
        return () => {
            slaveCamera.setView({
                destination: masterCamera.position.clone(),
                orientation: {
                    heading: masterCamera.heading,
                    pitch: masterCamera.pitch,
                    roll: masterCamera.roll
                }
            })
        }
    }
}