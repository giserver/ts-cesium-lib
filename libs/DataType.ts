/**
 * 标记类型
 *
 * @enum {number}
 */
enum ShapeType {

   /**
    * 点
    */
   Point,


   /**
    * 线
    */
   Line,


   /**
    * 面
    */
   Polygon

}

/**
 *  指针样式
 *
 * @enum {number}
 */
enum CursorStyle {
   /**
    * 默认样式
    */
   Default,


   /**
    * 十字样式
    */
   CrossHair,
}

/**
 * 空间类型  
 *
 * @enum {number}
 */
enum SpaceType {

   /**
    * 3D -> xyz
    */
   D3,

   /**
    * 2D -> xy
    */
   D2,

   /**
    * 高 -> z
    */
   H
}

/**
 * 天气类型
 *
 * @enum {number}
 */
enum WeatherType {

   /**
    * 无
    */
   None,
   /**
    * 雪天
    */
   Snow,
   /**
    * 雨天
    */
   Rain,

   /**
    * 雾天
    */
   Foggy,
}

interface MarkStyle{
   point_PixelSize?: number;
   point_Color?: string;

   line_Width?: number;
   line_MaterialColor?: string;
   line_DepthFailMaterialColor?: string;

   polygon_MaterialColor?: string;
   polygon_MaterialColor_Alpha?: number;
   polygon_Outline?: boolean;
   polygon_OutlineColor?: string;
   polygon_OutlineColor_Alpha?: number;
   polygon_OutlineWidth?: number;

   measureEnable?:boolean;
}

export {
   ShapeType,
   CursorStyle,
   SpaceType,
   WeatherType,
};

export type {MarkStyle};
