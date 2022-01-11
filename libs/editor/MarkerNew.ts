import { CallbackProperty, Cartesian3, Color, ConstantPositionProperty, Entity, HeightReference, JulianDate, PolygonHierarchy, PolylineGlowMaterialProperty, PolylineGraphics, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer } from "cesium";
import { FeatureBase, MarkStyle, ShapeType } from "..";
import { window2Proj } from "../Utils";

export default class MarkerNew extends FeatureBase {
    private handler: ScreenSpaceEventHandler;

    protected onActivityShapeChange?: (points: Array<Cartesian3>) => void;
    protected onStop?: () => void;

    /**
    * 标记样式
    *
    * @type {MarkStyle}
    * @memberof Marker
    */
    public readonly style: MarkStyle;

    /**
     * 
     */
    constructor(viewer: Viewer, private onEntitySave?: (entity: Entity) => void) {
        super(viewer);
        this.handler = viewer.screenSpaceEventHandler;

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

    start(type: ShapeType) {
        //设置十字光标
        this.setCursorStyle('CrossHair');

        let activeShape: Entity | undefined;    //动态图形
        let activeShapePoints: Array<Cartesian3> = [];  //动态图形点集合
        let floatingPoint: Entity | undefined;  //浮动点


        //鼠标左键点击 -> 开始绘制、初始化动态entity、向动态点集合添加动态点
        this.handler.setInputAction(event => {
            //获取地理坐标
            const position = window2Proj(this.viewer, event.position);
            if (position) {
                //如果标记类型是Point 第一个点就返回
                if (type === 'Point') {
                    const entity = this.drawShape('Point', position);
                    this.onActivityShapeChange?.call(this, [position]);
                    this.onEntitySave?.call(this, entity);
                    return;
                }

                //如果绘制第一笔 ,创建动态图形
                if (activeShapePoints.length === 0) {
                    //添加浮动点
                    floatingPoint = this.drawShape('Point', position);
                    //创建动态图形
                    activeShape = this.drawShape(type, new CallbackProperty(() => {
                        this.onActivityShapeChange?.call(this, activeShapePoints);
                        return type === 'Polygon' ? new PolygonHierarchy(activeShapePoints) : activeShapePoints;
                    }, false))

                    activeShapePoints.push(position);
                }

                //添加点
                activeShapePoints.push(position);
            }
        }, ScreenSpaceEventType.LEFT_CLICK);

        //鼠标移动 -> 移动浮动点
        this.handler.setInputAction(event => {
            const position = window2Proj(this.viewer, event.endPosition);
            if (floatingPoint && position)
                updateFloatingPoint(position);
        }, ScreenSpaceEventType.MOUSE_MOVE);

        //鼠标右键点击 -> 删除最后一个标记
        this.handler.setInputAction(event => {
            //删除最后一个标记
            let lastEntity = activeShapePoints.pop();

            let position = window2Proj(this.viewer, event.position);
            if (lastEntity && position)
                updateFloatingPoint(position);
        }, ScreenSpaceEventType.RIGHT_CLICK)

        function updateFloatingPoint(position: Cartesian3) {
            if (floatingPoint)
                floatingPoint.position = new ConstantPositionProperty(position);
            activeShapePoints.pop();
            activeShapePoints.push(position);
        }


        this.handler.setInputAction(event=>{
            activeShapePoints.pop();
            if(activeShapePoints.length){
                let entity = this.drawShape(type,activeShapePoints);
                this.onEntitySave?.call(this,entity);
            }

            if(floatingPoint) this.viewer.entities.remove(floatingPoint);
            if(activeShape) this.viewer.entities.remove(activeShape);

            floatingPoint = undefined;
            activeShape = undefined;
            activeShapePoints = [];
        }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }

    stop() {
        //设置默认光标
        this.setCursorStyle('Default');
        //关闭深度监测
        this.viewer.scene.globe.depthTestAgainstTerrain = false;

        //删除所有输入事件
        this.handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        this.handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        this.handler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        //停止标记回调
        this.onStop?.call(this);
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
        
        return ret_entity;
    }
}