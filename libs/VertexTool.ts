import { CallbackProperty, Cartesian3, Color, defaultValue, Entity, HeightReference, JulianDate, PolygonHierarchy, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer } from "cesium";
import FeatureBase from "./FeatureBase";

type removeEntityType = 'mask' | 'vertex';

export default class VertexTool extends FeatureBase {

    constructor(viewer: Viewer) {
        super(viewer);
    }

    start() {
        const viewer = this.viewer;

        // 鼠标经过的实体
        let currentEntity: Entity | undefined;

        // 经过实体的遮罩层
        let maskEntity: Entity | undefined;

        // 节点实体
        let vertexEntity: Entity | undefined;

        // 节点坐标在currentEntity坐标数组的index
        let vertexIndex: number = 0;

        // 是否正在绘制
        let isInDrawing = false;

        // 重绘时的图形
        let activeShape: Entity | undefined;

        // 重绘时的动态点
        let activeShapePoints = new Array<Cartesian3>();

        let handler = this.viewer.screenSpaceEventHandler;

        function getCurrentEntityPositions() {
            // 获取面的坐标
            let positions = currentEntity?.polygon?.hierarchy?.getValue(JulianDate.now()).positions as Cartesian3[];

            // 如果获取不到面的坐标，获取线的坐标
            if (!positions)
                positions = currentEntity?.polyline?.positions?.getValue(JulianDate.now()) as Cartesian3[];

            return positions;
        }

        function removeAuxiliaryEntity(type?: removeEntityType) {
            let entity: Entity | undefined;
            if (type === 'mask') entity = maskEntity;
            else if (type === 'vertex') entity = vertexEntity;
            else {
                removeAuxiliaryEntity('mask');
                removeAuxiliaryEntity('vertex');
            }

            if (entity) {
                viewer.entities.remove(entity);
                entity = undefined;
            }
        }

        function mouseMoveHandler(movement: any): any {
            //获取鼠标经过的entity
            let picked = viewer.scene.pick(movement.endPosition);
            if (picked) {
                let pickedEntity = defaultValue(picked.id, picked.primitive.id) as Entity;
                // 排除遮罩层
                if (maskEntity && pickedEntity.id === maskEntity.id) {
                    //删除动态节点
                    removeAuxiliaryEntity('vertex');
                    return;
                }

                // 排除节点
                if (vertexEntity && pickedEntity.id === vertexEntity.id)
                    return;

                //判断切换实体 判断当前实体是否已经被选中
                if (!currentEntity || pickedEntity.id !== currentEntity.id) {

                    removeAuxiliaryEntity('mask');

                    //设置遮罩层
                    if (pickedEntity.polygon) {
                        //为面设置遮罩层
                        let polygon = pickedEntity.polygon;
                        maskEntity = viewer.entities.add({
                            polygon: {
                                hierarchy: polygon.hierarchy,
                                material: Color.YELLOW.withAlpha(0.5),
                            }
                        })
                    } else if (pickedEntity.polyline) {
                        let polyline = pickedEntity.polyline;
                        //为多线段设置遮罩层
                        maskEntity = viewer.entities.add({
                            polyline: {
                                positions: polyline.positions,
                                clampToGround: true,
                                width: polyline.width,
                                material: Color.YELLOW.withAlpha(0.5),
                            }
                        });
                    }

                    currentEntity = pickedEntity;
                }
            } else {
                // 当前实体设置为空
                currentEntity = undefined;
                removeAuxiliaryEntity();
            }

            //获取鼠标当前坐标(笛卡尔坐标)
            let cartesian = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
            if (cartesian && currentEntity) {

                let positions = getCurrentEntityPositions();

                //获取坐标数组
                if (positions) {
                    removeAuxiliaryEntity('vertex');

                    for (let i = 0; i < positions.length; i++) {

                        //转换为屏幕像素
                        let canvasPosition1 = viewer.scene.cartesianToCanvasCoordinates(positions[i]);
                        let canvasPosition2 = viewer.scene.cartesianToCanvasCoordinates(cartesian);
                        let dertx = Math.abs(canvasPosition1.x - canvasPosition2.x);
                        let derty = Math.abs(canvasPosition1.y - canvasPosition2.y);

                        //像素差小于10 匹配
                        if (dertx < 10 && derty < 10) {
                            vertexIndex = i;
                            vertexEntity = viewer.entities.add({
                                ellipse:{
                                    semiMinorAxis: 15,
                                    semiMajorAxis: 150,
                                    material: Color.YELLOW,
                                    outline:true,
                                    fill:true,
                                    outlineColor:Color.YELLOW,
                                    outlineWidth:3
                                },
                                position: positions[i]
                            });

                            break;
                        }
                    }
                }
            }
        }

        function clickVertexHandler(e: any) {
            if (!vertexEntity || !currentEntity) return;

            if (!isInDrawing) { //动态绘制辅助线
                isInDrawing = true;
                activeShapePoints = [];

                //开启地形深度检测，如果鼠标指针和点不重合，这个选项设置为true试试。
                viewer.scene.globe.depthTestAgainstTerrain = true;
                let positions = getCurrentEntityPositions();

                let activeVertexPosition = positions[vertexIndex];
                if (vertexIndex === 0)
                    activeShapePoints.push(positions[positions.length - 1]);
                else
                    activeShapePoints.push(positions[vertexIndex - 1]);

                activeShapePoints.push(activeVertexPosition);

                if (vertexIndex === positions.length - 1)
                    activeShapePoints.push(positions[0]);
                else
                    activeShapePoints.push(positions[vertexIndex + 1]);

                activeShape = viewer.entities.add({
                    polyline: {
                        positions: new CallbackProperty(() => activeShapePoints, false),
                        clampToGround: true,
                        width: 1,
                        material: Color.BLUE,
                    }
                });

                //实现动态绘制辅助线
                handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                handler.setInputAction(e => {
                    let position = viewer.scene.pickPosition(e.endPosition);
                    if (position)
                        activeShapePoints[1] = position;
                }, ScreenSpaceEventType.MOUSE_MOVE)

                handler.setInputAction((e) => {
                    if (!currentEntity) return;

                    isInDrawing = false;
                    let positions = getCurrentEntityPositions();

                    positions.splice(vertexIndex, 1);

                    if (currentEntity.polygon) {
                        currentEntity.polygon.hierarchy = new PolygonHierarchy(positions) as any;
                        if (currentEntity.polyline) {
                            let polylinePositions = positions.concat(positions[0]);
                            currentEntity.polyline.positions = polylinePositions as any;
                        }
                    } else if (currentEntity.polyline)
                        currentEntity.polyline.positions = positions as any;

                    if (activeShape)
                        viewer.entities.remove(activeShape);

                    removeAuxiliaryEntity();

                    viewer.scene.globe.depthTestAgainstTerrain = false;
                    handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                    handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
                    //恢复搜索顶点状态
                    handler.setInputAction(mouseMoveHandler, ScreenSpaceEventType.MOUSE_MOVE);
                }, ScreenSpaceEventType.RIGHT_CLICK)

            } else {                   //重绘currentEntity
                isInDrawing = false;

                let positions = getCurrentEntityPositions();
                positions[vertexIndex] = activeShapePoints[1];

                if (currentEntity.polygon) {
                    currentEntity.polygon.hierarchy = new PolygonHierarchy(positions) as any;
                    if (currentEntity.polyline) {
                        let polylinePositions = positions.concat(positions[0]);
                        currentEntity.polyline.positions = polylinePositions as any;
                    }
                } else if (currentEntity.polyline)
                    currentEntity.polyline.positions = positions as any;

                if (activeShape)
                    viewer.entities.remove(activeShape);

                currentEntity = undefined;
                removeAuxiliaryEntity();

                viewer.scene.globe.depthTestAgainstTerrain = false;
                handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
                //恢复搜索顶点状态
                handler.setInputAction(mouseMoveHandler, ScreenSpaceEventType.MOUSE_MOVE);
            }
        }

        handler.setInputAction(mouseMoveHandler, ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(clickVertexHandler, ScreenSpaceEventType.LEFT_CLICK);
    }

    stop() {
        this.viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
    }

    clear(): void {
        this.stop();
    }
}