import { CallbackProperty, Cartesian3, Color, Entity, HeightReference, JulianDate, PolylineGlowMaterialProperty, PolylineGraphics, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer } from "cesium";
import { FeatureBase, EditorStyle, ShapeType } from "..";
import { MeasureMode } from "../DataType";

export default abstract class Editor<T extends ShapeType | MeasureMode> extends FeatureBase {
    protected currentMode : T | undefined;
    protected readonly handler : ScreenSpaceEventHandler;
    
    /**
    * 标记样式
    *
    * @type {EditorStyle}
    * @memberof Marker
    */
     public readonly style: EditorStyle;
    
    constructor(viewer: Viewer, style?: EditorStyle) {
        super(viewer);
        this.handler = viewer.screenSpaceEventHandler;
        this.style = style || {
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

    protected abstract onStart(mode: T): void;
    protected abstract onStop(): void;

    public start(mode:T){
        this.setCursorStyle('CrossHair');
        this.currentMode = mode;
        this.onStart(mode);
    }

    public stop(){
        //设置默认光标
        this.setCursorStyle('Default');
        //关闭深度监测
        this.viewer.scene.globe.depthTestAgainstTerrain = false;

        const handler = this.handler;
         //删除所有输入事件
         handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
         handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
         handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
         handler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

         this.onStop();
    }

     /**
     * 绘制形状
     *
     * @private
     * @param {ShapeType} shapetype 形状类型
     * @param {*} position 形状点位
     * @return {*}  {Entity}
     * @memberof Mark
     */
      protected drawShape(shapetype: ShapeType, position: any): Entity {
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

                //获取polygon的轮廓闭合点
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
    }
}