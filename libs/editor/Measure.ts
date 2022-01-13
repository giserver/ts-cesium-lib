import { BoundingSphere, Cartesian3, ConstantPositionProperty, Entity, JulianDate, Viewer } from "cesium";
import { addArrayListener, Marker, removeEntityByName } from "..";
import { MeasureMode } from "../DataType";
import { calArea, calLength, createLabel } from "../Utils";

const MEASURE_DEFINE_NAME = "MEASURE_DEFINE_NAME"

export default class Measure extends Marker {
    constructor(viewer: Viewer) {
        super(viewer, entity => entity.name = MEASURE_DEFINE_NAME);

        this.onActivityShapeChange = this.handleEntityOnceDraw;
    }

    start(mode: MeasureMode) {
        if (mode === 'Triangle') {
        }
        else {
            super.start(mode);
        }
    }

    stop(): void {
        super.stop();
        removeEntityByName(this.viewer.entities, MEASURE_DEFINE_NAME);
    }

    private handleEntityOnceDraw(entity: Entity) {
        //添加测量面积
        if (this.currentType === 'Polygon' && entity.polygon) {
            let polylinePositaions = entity.polygon?.hierarchy?.getValue(JulianDate.now()).positions as Cartesian3[];
            if (polylinePositaions.length < 3) {
                entity.position = undefined;
            }
            else {
                let area = calArea(polylinePositaions);
                entity.position = new ConstantPositionProperty(BoundingSphere.fromPoints(polylinePositaions).center);
                entity.label = createLabel('面积: ' + (area > 10000 ? (area / 1000000).toFixed(4) + ' km²' : area.toFixed(2) + ' m²'));
            }
        }
    }

    /**
    * 测量线标记
    *
    * @private
    * @param {Array<Entity>} markPoints
    * @memberof Mark
    */
    private addLineMeasure(markPoints: Array<Entity>) {

        //添加点事件
        addArrayListener(markPoints, "push", (array, args) => {
            if (this.currentType === 'Line') {
                let entity = args[0] as Entity;
                let length = 0;

                if (array.length !== 0) {
                    for (let i = 0; i < array.length; i++) {
                        let currentPoint = array[i].position?.getValue(JulianDate.now());

                        //获取下一个点 当i为数组最后一个下标则设置为push的参数
                        let nextPoint = i === array.length - 1 ?
                            entity.position?.getValue(JulianDate.now()) :
                            array[i + 1].position?.getValue(JulianDate.now());

                        if (currentPoint !== undefined && nextPoint !== undefined)
                            length += calLength([currentPoint, nextPoint]);
                    }
                }
                entity.name = MEASURE_DEFINE_NAME;
                entity.label = createLabel(length === 0 ? "起点" : length < 1000 ? `${length.toFixed(2)} m` : `${(length / 1000.0).toFixed(4)} km`);
                this.viewer.entities.add(entity);
            }
        })

        //删除点事件
        addArrayListener(markPoints, "pop", (array, args) => {
            if (this.currentType === 'Line')
                this.viewer.entities.remove(array[array.length - 1]);
        })
    }
}