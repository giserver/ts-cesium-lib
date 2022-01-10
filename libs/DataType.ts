/**
 * 形状 点 | 线 | 面
 */
export type ShapeType = 'Point' | 'Line' | 'Polygon';

/**
 * 测量模式 兼容形状 扩展三角测量
 */
export type MeasureMode = ShapeType | 'Triangle';

/**
 * 指针类型 默认 | 十字
 */
export type CursorStyle = 'Default' | 'CrossHair';

/**
 * 空间类型 三维 | 二维 | 高
 */
export type SpaceType = 'D3' | 'D2' | 'H';

/**
 * 天气类型 无 | 雪 | 雨 | 雾
 */
export type WeatherType = 'None' | 'Snow' | 'Rain' | 'Foggy';

export interface MarkStyle {
   point_PixelSize: number;
   point_Color: string;

   line_Width: number;
   line_MaterialColor: string;

   polygon_MaterialColor: string;
   polygon_MaterialColor_Alpha: number;
   polygon_Outline: boolean;
   polygon_OutlineColor: string;
   polygon_OutlineWidth: number;
}