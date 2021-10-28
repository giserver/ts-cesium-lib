import {WebMercatorTilingScheme,Math as CesiumMath,Cartographic,Cartesian2,Rectangle,defined, Ellipsoid, Cartesian3} from 'cesium'
import CoordTransform from '../CoordTransform'
import BaiduMercatorProjection from '../projection/BaiduMercatorProjection'

class BaiduMercatorTilingScheme extends WebMercatorTilingScheme {
  resolutions:number[];

  constructor(options?: {
    ellipsoid?: Ellipsoid;
    numberOfLevelZeroTilesX?: number;
    numberOfLevelZeroTilesY?: number;
    rectangleSouthwestInMeters?: Cartesian2;
    rectangleNortheastInMeters?: Cartesian2;
    resolutions:number[]
}) {
    super(options)
    let projection = new BaiduMercatorProjection()
    this.projection.project = function(cartographic, result) {

      let ret = CoordTransform.WGS84ToGCJ02(
        CesiumMath.toDegrees(cartographic.longitude),
        CesiumMath.toDegrees(cartographic.latitude)
      )

      ret = CoordTransform.GCJ02ToBD09(ret[0], ret[1])
      ret[0] = Math.min(ret[0], 180)
      ret[0] = Math.max(ret[0], -180)
      ret[1] = Math.min(ret[1], 74.000022)
      ret[1] = Math.max(ret[1], -71.988531)
      let ret1 = projection.lngLatToPoint({
        lng: ret[0],
        lat: ret[1]
      })
      return new Cartesian3(ret1.x, ret1.y)
    }

    this.projection.unproject = function(cartesian, result) {
      
      let ret = projection.mercatorToLngLat({
        lng: cartesian.x,
        lat: cartesian.y
      });

      let ret1 = CoordTransform.BD09ToGCJ02(ret.lng, ret.lat)
      ret1 = CoordTransform.GCJ02ToWGS84(ret1[0], ret1[1])
      return new Cartographic(
        CesiumMath.toRadians(ret1[0]),
        CesiumMath.toRadians(ret1[1])
      )
    }
    this.resolutions = options.resolutions || []
  }

  /**
   *
   * @param x
   * @param y
   * @param level
   * @param result
   * @returns {module:cesium.Rectangle|*}
   */
  tileXYToNativeRectangle(x:number, y:number, level:number, result?: any) {
    const tileWidth = this.resolutions[level]
    const west = x * tileWidth
    const east = (x + 1) * tileWidth
    const north = ((y = -y) + 1) * tileWidth
    const south = y * tileWidth

    if (!defined(result)) {
      return new Rectangle(west, south, east, north)
    }

    result.west = west
    result.south = south
    result.east = east
    result.north = north
    return result
  }

  /**
   *
   * @param position
   * @param level
   * @param result
   * @returns {undefined|*}
   */
  positionToTileXY(position: Cartographic, level: number, result?: Cartesian2): Cartesian2 {
    const rectangle = this.rectangle
    if (!Rectangle.contains(rectangle, position)) {
      return undefined
    }
    const projection = this.projection
    const webMercatorPosition = projection.project(position)
    if (!defined(webMercatorPosition)) {
      return undefined
    }
    const tileWidth = this.resolutions[level]
    const xTileCoordinate = Math.floor(webMercatorPosition.x / tileWidth)
    const yTileCoordinate = -Math.floor(webMercatorPosition.y / tileWidth)
    if (!defined(result)) {
      return new Cartesian2(xTileCoordinate, yTileCoordinate)
    }
    result.x = xTileCoordinate
    result.y = yTileCoordinate
    return result
  }
}

export default BaiduMercatorTilingScheme