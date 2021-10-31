import { Cartesian2, defaultValue, Entity, ScreenSpaceEventType, Viewer } from "cesium";
import { FeatureBase } from "..";

/**
 * 实体选择
 *
 * @export
 * @class EntityPicker
 * @extends {FeatureBase}
 */
export default class EntityPicker extends FeatureBase{

    constructor(viewer:Viewer){
        super(viewer);
    }

    /**
     * 启动选择
     *
     * @param {(entity:Entity,position:Cartesian2) => void} callback entity ：选择获取到的实体  position ：指针单击屏幕坐标
     * @memberof EntityPicker
     */
    start(callback:(entity:Entity,position:Cartesian2) => void){
        this.viewer.screenSpaceEventHandler.setInputAction((e)=>{
            let picked = this.viewer.scene.pick(e.position);
            if(picked){
                let pickedEntity = defaultValue(picked.id, picked.primitive.id);
                callback(pickedEntity,e.position);
            }
        },ScreenSpaceEventType.LEFT_CLICK)

        this.viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }

    /**
     * 停止选择
     *
     * @memberof EntityPicker
     */
    stop(){
        this.viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
    }
}