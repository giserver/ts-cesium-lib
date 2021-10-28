import { Math as CesiumMath, WebMercatorTilingScheme, WebMercatorProjection, Cartographic, Cartesian2, Ellipsoid, Cartesian3 } from 'cesium'
import CoordTransform from '../CoordTransform'

class AmapMercatorTilingScheme extends WebMercatorTilingScheme {
  constructor(options?: {
    ellipsoid?: Ellipsoid;
    numberOfLevelZeroTilesX?: number;
    numberOfLevelZeroTilesY?: number;
    rectangleSouthwestInMeters?: Cartesian2;
    rectangleNortheastInMeters?: Cartesian2;
  }) {
    super(options)

    let projection = new WebMercatorProjection()

    this.projection.project = function (cartographic: Cartographic, result?: Cartesian3): Cartesian3 {

      let ret = CoordTransform.WGS84ToGCJ02(
        CesiumMath.toDegrees(cartographic.longitude),
        CesiumMath.toDegrees(cartographic.latitude)
      )

      result = projection.project(
        new Cartographic(
          CesiumMath.toRadians(ret[0]),
          CesiumMath.toRadians(ret[1])
        )
      )

      return new Cartesian3(result.x, result.y);
    }

    this.projection.unproject = function (cartesian: Cartesian3, result?: Cartographic): Cartographic {
      let cartographic = projection.unproject(cartesian)
      let ret = CoordTransform.GCJ02ToWGS84(
        CesiumMath.toDegrees(cartographic.longitude),
        CesiumMath.toDegrees(cartographic.latitude)
      )
      return new Cartographic(
        CesiumMath.toRadians(ret[0]),
        CesiumMath.toRadians(ret[1])
      )
    }
  }
}

export default AmapMercatorTilingScheme