import { CallbackProperty, Cartesian3, Color, ConstantPositionProperty, defined, Entity, HeightReference, JulianDate, PolygonHierarchy, PolylineGlowMaterialProperty, PolylineGraphics, ScreenSpaceEventType, Viewer } from "cesium";
import { FeatureBase, ShapeType, MarkStyle } from "..";
import { window2Proj } from "../Utils";

/**
 * 标记功能
 *
 * @class Mark
 */
export default class Marker extends FeatureBase {

    private callback?: (entity: Entity) => void;

    protected currentType: ShapeType = 'Point';
    protected markPoints: Array<Entity> = [];
    protected onEntityOnceDraw: ((entity: Entity) => void) | undefined;

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

        //双击鼠标左键清除默认事件
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        //鼠标左键 event  -> 创建标记点
        handler.setInputAction(event => {

            let position = window2Proj(this.viewer, event.position)
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
                this.markPoints.push(new Entity({
                    position: new ConstantPositionProperty(position)
                }))
            }
        }, ScreenSpaceEventType.LEFT_CLICK)

        //鼠标移动 event -> 移动至下一个标记点
        handler.setInputAction(event => {
            if (defined(floatingPoint)) {
                let position = window2Proj(this.viewer, event.endPosition);
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
                let position = window2Proj(this.viewer, event.position);
                if (position) {
                    if (floatingPoint)
                        floatingPoint.position = new ConstantPositionProperty(position);
                    activeShapePoints.pop();
                    activeShapePoints.push(position);
                }

                this.markPoints.pop();
            }
        }, ScreenSpaceEventType.RIGHT_CLICK)

        //鼠标左键双击 event -> 完成标记
        handler.setInputAction(event => {
            activeShapePoints.pop(); 
            activeShapePoints.pop();//去除最后一个动态点
            if (activeShapePoints.length) {
                let entity = this.drawShape(type, activeShapePoints); //绘制最终图
                if (this.callback)
                    this.callback(entity);
            }
            if (floatingPoint)
                viewer.entities.remove(floatingPoint); //去除动态点图形（当前鼠标点）
            if (activeShape)
                viewer.entities.remove(activeShape); //去除动态图形
            floatingPoint = undefined;
            activeShape = undefined;
            activeShapePoints = [];
            this.markPoints.length = 0;
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
    protected drawShape(shapetype: ShapeType, position: any): Entity {
        let ret_entity = (() => {
            switch (shapetype) {
                case 'Point':
                    return this.viewer.entities.add({
                        position: position,
                        point: {
                            color: Color.fromCssColorString(this.style.point_Color),
                            pixelSize: this.style.point_PixelSize,
                            heightReference: HeightReference.CLAMP_TO_GROUND
                        }
                    });
                case 'Line':
                    return this.viewer.entities.add({
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
                        polygon: {
                            hierarchy: position,
                            material: Color.fromCssColorString(this.style.polygon_MaterialColor)
                                .withAlpha(this.style.polygon_MaterialColor_Alpha)
                        }
                    });

                    //获取polygon的轮廓闭合点 计算测量结果
                    let getRings = () => {
                        if (this.onEntityOnceDraw) this.onEntityOnceDraw(entity);
                        let polylinePositaions = new Array<Cartesian3>().concat(entity.polygon?.hierarchy?.getValue(JulianDate.now()).positions as Cartesian3[]);
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
        })();
        
        if (this.onEntityOnceDraw) this.onEntityOnceDraw(ret_entity);
        return ret_entity;
    }
}