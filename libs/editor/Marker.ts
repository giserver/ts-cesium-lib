import { BoundingSphere, CallbackProperty, Cartesian3, Cesium3DTileset, Color, ConstantPositionProperty, defined, Entity, HeightReference, JulianDate, PolygonHierarchy, PolylineGlowMaterialProperty, PolylineGraphics, ScreenSpaceEventType, Viewer } from "cesium";
import { FeatureBase, removeEntityByName, addArrayListener, ShapeType, MarkStyle } from "..";
import { calArea, calLength, createLabel } from "../Utils";

const MEASURE_DEFINE_NAME = "MEASURE_DEFINE_NAME"

/**
 * 标记功能
 *
 * @class Mark
 */
export default class Marker extends FeatureBase {

    private callback?: (entity: Entity) => void;
    private currentType: ShapeType = 'Point';

    /**
     * 标记样式
     *
     * @type {MarkStyle}
     * @memberof Marker
     */
    public readonly style: MarkStyle;

    constructor(viewer: Viewer, callback?: (entity: Entity) => void) {
        super(viewer);
        this.callback = callback;

        this.style = {
            point_Color: "#ffffff",
            point_PixelSize: 5,
            line_Width: 5,
            line_MaterialColor: "#ff0000",
            polygon_Outline: true,
            polygon_OutlineWidth: 1,
            polygon_OutlineColor: "#90EE90",
            polygon_MaterialColor: "#ff0000",
            polygon_MaterialColor_Alpha: 0.2,
            measureEnable: false,
        };
    }

    /**
     * 开始标记功能
     *
     * @param {MarkProps} props 标记类型
     * @memberof Mark
     */
    start(type: ShapeType) {
        this.currentType = type;
        this.setCursorStyle('CrossHair');

        const viewer = this.viewer;
        const handler = viewer.screenSpaceEventHandler;
        let activeShapePoints: Array<Cartesian3> = [];
        let floatingPoint: Entity | undefined;
        let activeShape: Entity | undefined;
        let markPoints: Array<Entity> = [];

        this.addLineMeasure(markPoints);

        //双击鼠标左键清除默认事件
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        //鼠标左键 event  -> 创建标记点
        handler.setInputAction(event => {

            let position = this.getPointFromWindowPoint(event.position)
            if (!position) return;

            if (defined(position)) {
                //如果标记类型为点，直接return
                if (type === 'Point') {
                    let entity = this.drawShape('Point', position);
                    if (this.callback !== undefined)
                        this.callback(entity);
                    return;
                }

                if (activeShapePoints.length === 0) {
                    floatingPoint = this.drawShape('Point', position);
                    activeShapePoints.push(position);
                    activeShape = this.drawShape(type, new CallbackProperty(() => {
                        if (type === 'Polygon') {
                            return new PolygonHierarchy(activeShapePoints);
                        }
                        return activeShapePoints;
                    }, false));
                }
                activeShapePoints.push(position);
                markPoints.push(new Entity({
                    name: this.getEntityName(),
                    position: new ConstantPositionProperty(position)
                }))
            }
        }, ScreenSpaceEventType.LEFT_CLICK)

        //鼠标移动 event -> 移动至下一个标记点
        handler.setInputAction(event => {
            if (defined(floatingPoint)) {
                let position = this.getPointFromWindowPoint(event.endPosition);
                if (position) {
                    if (floatingPoint)
                        floatingPoint.position = new ConstantPositionProperty(position);
                    activeShapePoints.pop();
                    activeShapePoints.push(position);
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE)

        //鼠标右键点击  删除最后一个标记点
        handler.setInputAction(event => {
            //删除最后一个标记
            let lastEntity = activeShapePoints.pop();
            if (lastEntity !== undefined) {
                //重置浮动点坐标
                let position = this.getPointFromWindowPoint(event.position);
                if (position) {
                    if (floatingPoint)
                        floatingPoint.position = new ConstantPositionProperty(position);
                    activeShapePoints.pop();
                    activeShapePoints.push(position);
                }

                markPoints.pop();
            }
        }, ScreenSpaceEventType.RIGHT_CLICK)

        //鼠标左键双击 event -> 完成标记
        handler.setInputAction(event => {
            activeShapePoints.pop(); //去除最后一个动态点
            if (activeShapePoints.length) {
                let entity = this.drawShape(type, activeShapePoints); //绘制最终图
                if (this.callback != undefined) {
                    this.callback(entity);
                }
            }
            if (floatingPoint)
                viewer.entities.remove(floatingPoint); //去除动态点图形（当前鼠标点）
            if (activeShape)
                viewer.entities.remove(activeShape); //去除动态图形
            floatingPoint = undefined;
            activeShape = undefined;
            activeShapePoints = [];
            markPoints.length = 0;
        }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }

    /**
     * 停止标记
     *
     * @memberof Mark
     */
    stop() {
        this.setCursorStyle('Default');
        const handler = this.viewer.screenSpaceEventHandler;

        handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
        handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        handler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        this.viewer.scene.globe.depthTestAgainstTerrain = false;

        //删除测量数据
        removeEntityByName(this.viewer, MEASURE_DEFINE_NAME);
    }

    /**
     * 获取实体名称
     *
     * @private
     * @return {*}  {string}
     * @memberof Marker
     */
    private getEntityName(): string {
        return this.style.measureEnable ? MEASURE_DEFINE_NAME : "";
    }

    private getPointFromWindowPoint(point: any) {
        const viewer = this.viewer;
        const primitives = this.viewer.scene.primitives;
        let has3Dtiles = false;
        for (let i = 0; i < primitives.length; i++) {
            has3Dtiles = primitives.get(i) instanceof Cesium3DTileset;
            if (has3Dtiles) break;
        }

        if (viewer.scene.terrainProvider.constructor.name == "EllipsoidTerrainProvider" && !has3Dtiles) {
            return viewer.camera.pickEllipsoid(point, viewer.scene.globe.ellipsoid);
        } else {
            return viewer.scene.pickPosition(point);
        }
    }

    /**
     * 绘制形状
     *
     * @private
     * @param {ShapeType} shapetype 形状类型
     * @param {*} position 形状点位
     * @param {boolean} [measureEnable] 是否开启测量
     * @return {*}  {Entity}
     * @memberof Mark
     */
    private drawShape(shapetype: ShapeType, position: any): Entity {
        const entityName = this.getEntityName();
        switch (shapetype) {
            case 'Point':
                return this.viewer.entities.add({
                    name: entityName,
                    position: position,
                    point: {
                        color: Color.fromCssColorString(this.style.point_Color),
                        pixelSize: this.style.point_PixelSize,
                        heightReference: HeightReference.CLAMP_TO_GROUND
                    }
                });
            case 'Line':
                return this.viewer.entities.add({
                    name: entityName,
                    polyline: {
                        positions: position,
                        clampToGround: true,
                        width: this.style.line_Width,
                        material: new PolylineGlowMaterialProperty({
                            color: Color.fromCssColorString(this.style.line_MaterialColor)
                        })
                    }
                });
            case 'Polygon':
                var entity = this.viewer.entities.add({
                    name: entityName,
                    polygon: {
                        hierarchy: position,
                        material: Color.fromCssColorString(this.style.polygon_MaterialColor)
                            .withAlpha(this.style.polygon_MaterialColor_Alpha)
                    }
                });

                //获取polygon的轮廓闭合点 计算测量结果
                let getRings = () => {
                    let polylinePositaions: Array<Cartesian3> = [];
                    polylinePositaions = polylinePositaions.concat(entity.polygon?.hierarchy?.getValue(JulianDate.now()).positions as Cartesian3[]);

                    //添加测量面积
                    if (this.style.measureEnable) {
                        if (polylinePositaions.length < 3) {
                            entity.position = undefined;
                        }
                        else {
                            let area = calArea(polylinePositaions);
                            entity.position = new ConstantPositionProperty(BoundingSphere.fromPoints(polylinePositaions).center);
                            entity.label = createLabel('面积: ' + (area > 10000 ? (area / 1000000).toFixed(4) + ' km²' : area.toFixed(2) + ' m²'));
                        }
                    }

                    polylinePositaions.push(polylinePositaions[0]);
                    return polylinePositaions;
                }

                if (this.style.polygon_Outline) {
                    //添加外轮廓
                    entity.polyline = new PolylineGraphics({
                        positions: position instanceof CallbackProperty ? new CallbackProperty(getRings, false) : getRings(),
                        width: this.style.polygon_OutlineWidth,
                        material: Color.fromCssColorString(this.style.polygon_OutlineColor),
                        clampToGround: true
                    })
                }

                return entity;
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
            if (this.style.measureEnable && this.currentType === 'Line') {
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

                entity.label = createLabel(length === 0 ? "起点" : length < 1000 ? `${length.toFixed(2)} m` : `${(length / 1000.0).toFixed(4)} km`);
                this.viewer.entities.add(entity);
            }
        })

        //删除点事件
        addArrayListener(markPoints, "pop", (array, args) => {
            if (this.style.measureEnable && this.currentType === 'Line')
                this.viewer.entities.remove(array[array.length - 1]);
        })
    }
}