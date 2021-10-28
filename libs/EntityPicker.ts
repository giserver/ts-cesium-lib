import { defaultValue, Entity, ScreenSpaceEventType, Viewer } from "cesium";
import { FeatureBase } from ".";

export default class EntityPicker extends FeatureBase{

    private declare pickedEntity:Entity;

    constructor(viewer:Viewer){
        super(viewer);
    }

    start(callback:(entity:Entity) => void){
        this.viewer.screenSpaceEventHandler.setInputAction((e)=>{
            console.log(e);
            let picked = this.viewer.scene.pick(e.position);
            if(picked){
                let pickedEntity = defaultValue(picked.id, picked.primitive.id);
                callback(pickedEntity);
            }
        },ScreenSpaceEventType.LEFT_CLICK)

        this.viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }

    stop(){
        this.viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
    }

    clear(): void {
        this.stop();
    }
}