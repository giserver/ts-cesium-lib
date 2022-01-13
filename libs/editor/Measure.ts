import { BoundingSphere, Cartesian3, ConstantPositionProperty, Entity, JulianDate, Viewer } from "cesium";
import { addArrayListener, Marker, removeEntityByName, ShapeType, Editor, MeasureMode, calArea, calLength, createLabel } from "..";

const MEASURE_DEFINE_NAME = "MEASURE_DEFINE_NAME"

/**
 * 测量功能
 */
export default class Measure extends Editor<MeasureMode> {
    private marker: Marker;
    private areaLable: Entity | undefined;  //面积显示标注
    private linePoints: Array<Entity> | undefined; //线测量标注

    constructor(viewer: Viewer) {
        super(viewer);
        this.marker = new Marker(viewer, entity => {
            entity.name = MEASURE_DEFINE_NAME;
            this.areaLable = undefined;
            this.linePoints = undefined;
        }, this.handleActivityShapeChange());
    }

    protected override onStart() {
        const mode = <MeasureMode>this.currentMode;
        if (mode === 'Triangle') {
        }
        else {
            this.marker.start(mode);
        }
    }

    protected override onStop(): void {
        removeEntityByName(this.viewer.entities, MEASURE_DEFINE_NAME);
    }

    private handleActivityShapeChange() {
        const that = this;
        return (mode: ShapeType, points: Array<Cartesian3>) => {
            if (mode === 'Point') {
                const point = points[0];
                that.viewer.entities.add(new Entity({
                    name: MEASURE_DEFINE_NAME,
                    position: point,
                    label: createLabel(`x:${point.x},y:${point.y}`)
                }));
            }
            else if (mode === 'Line') {
                if (that.linePoints === undefined) {
                    console.log(that);
                    that.linePoints = new Array<Entity>();
                    this.addLineMeasure(that.linePoints);
                }

                let count = points.length - that.linePoints.length;
                for (let i = 0; i < Math.abs(count); i++) {
                    if (count < 0)
                        that.linePoints.pop();
                    else if (count > 0)
                        that.linePoints.push(new Entity({
                            name: MEASURE_DEFINE_NAME,
                            position: points[that.linePoints.length]
                        }))
                }
            }
            else if (mode === 'Polygon') {
                if (that.areaLable === undefined)
                    that.areaLable = that.viewer.entities.add(new Entity({
                        name: MEASURE_DEFINE_NAME
                    }));
                if (points.length < 3) {
                    that.areaLable.position = undefined;
                }
                else {
                    let area = calArea(points);
                    that.areaLable.position = new ConstantPositionProperty(BoundingSphere.fromPoints(points).center);
                    that.areaLable.label = createLabel('面积: ' + (area > 10000 ? (area / 1000000).toFixed(4) + ' km²' : area.toFixed(2) + ' m²'));
                }
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

        })

        //删除点事件
        addArrayListener(markPoints, "pop", (array, args) => {
            this.viewer.entities.remove(array[array.length - 1]);
        })
    }
}