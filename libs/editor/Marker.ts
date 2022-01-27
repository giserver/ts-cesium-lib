import { CallbackProperty, Cartesian3, ConstantPositionProperty, Entity, PolygonHierarchy, ScreenSpaceEventType, Viewer } from "cesium";
import { ShapeType, EditorStyle } from "..";
import { window2Proj } from "../Utils";
import Editor from "./Editor";

export default class Marker extends Editor<ShapeType> {

    private onEntitySave?: (type: ShapeType, entity: Entity) => void
    public onActivityShapeChange?: (mode: ShapeType, points: Array<Cartesian3>) => void
    public onPushPoint?: (point: Cartesian3) => void;
    public onPopPoint?: (point: Cartesian3) => void;

    constructor(viewer: Viewer, onEntitySave?: (type: ShapeType, entity: Entity) => void, style?: EditorStyle) {
        super(viewer, style);
        this.onEntitySave = onEntitySave;
    }

    protected override onStart() {
        const type = <ShapeType>this.currentMode;

        let activeShape: Entity | undefined;    //动态图形
        let activeShapePoints: Array<Cartesian3> = [];  //动态图形点集合
        let floatingPoint: Entity | undefined;  //浮动点

        //鼠标左键点击 -> 开始绘制、初始化动态entity、向动态点集合添加动态点
        this.handler.setInputAction((event: any) => {
            //获取地理坐标
            const position = window2Proj(this.viewer, event.position);
            if (position) {
                //执行添加点事件
                this.onPushPoint?.call(this, position);

                //如果标记类型是Point 第一个点就返回
                if (type === 'Point') {
                    const entity = this.drawShape('Point', position);
                    this.onEntitySave?.call(this, type, entity);
                    return;
                }

                //如果绘制第一笔 ,创建动态图形
                if (activeShapePoints.length === 0) {
                    //添加浮动点
                    floatingPoint = this.drawShape('Point', position);
                    //创建动态图形
                    activeShape = this.drawShape(type, new CallbackProperty(() => {
                        this.onActivityShapeChange?.call(this, type, activeShapePoints);
                        return type === 'Polygon' ? new PolygonHierarchy(activeShapePoints) : activeShapePoints;
                    }, false))

                    activeShapePoints.push(position);
                }

                activeShapePoints.push(position);
            }
        }, ScreenSpaceEventType.LEFT_CLICK);

        //鼠标移动 -> 移动浮动点
        this.handler.setInputAction((event: any) => {
            const position = window2Proj(this.viewer, event.endPosition);
            if (floatingPoint && position)
                updateFloatingPoint(position);
        }, ScreenSpaceEventType.MOUSE_MOVE);

        //鼠标右键点击 -> 删除最后一个标记
        this.handler.setInputAction((event: any) => {
            //删除最后一个标记
            let lastEntity = activeShapePoints.pop();

            let position = window2Proj(this.viewer, event.position);
            if (lastEntity && position) {
                this.onPopPoint?.call(this, position);
                updateFloatingPoint(position);
            }
        }, ScreenSpaceEventType.RIGHT_CLICK)

        function updateFloatingPoint(position: Cartesian3) {
            if (floatingPoint)
                floatingPoint.position = new ConstantPositionProperty(position);
            activeShapePoints.pop();
            activeShapePoints.push(position);
        }

        //鼠标左键双击 -> 完成标记
        this.handler.setInputAction((event: any) => {
            activeShapePoints.pop();
            activeShapePoints.pop();
            if (activeShapePoints.length) {
                let entity = this.drawShape(type, activeShapePoints);
                this.onEntitySave?.call(this, type, entity);
            }

            //释放资源
            if (floatingPoint) this.viewer.entities.remove(floatingPoint);
            if (activeShape) this.viewer.entities.remove(activeShape);
            floatingPoint = undefined;
            activeShape = undefined;
            activeShapePoints = [];
        }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }

    protected override onStop() {
    }
}