import { WebMercatorTilingScheme, Cartesian2, ImageryProvider, DeveloperError, Rectangle } from 'cesium'
import BaiduMercatorTilingScheme from '../tiling-scheme/BaiduMecatorTilingScheme'
import { CustomProviderStyle, BMAP_IMG_URL, BMAP_ELEC_URL,CrsType } from '../ProviderStyle';

type BaiduImageryProviderConstructorOptions = {
  style: CustomProviderStyle,
  crs?: CrsType,
  labelStyle?: string,
}

class BaiduImageryProvider {

  _url: string;
  _labelStyle: string;
  _tileWidth: number;
  _tileHeight: number;
  _maximumLevel: number;
  _crs: string;
  _tilingScheme: WebMercatorTilingScheme;
  _rectangle: Rectangle;
  _credit: any;
  _token?: string;
  _style: string;

  constructor(options: BaiduImageryProviderConstructorOptions) {
    this._url = options.style === 'img' ? BMAP_IMG_URL : BMAP_ELEC_URL;
    this._labelStyle = options.labelStyle || 'web2D'
    this._tileWidth = 256
    this._tileHeight = 256
    this._maximumLevel = 18
    this._crs = options.crs === 'SELF' ?  'BD09' : 'WGS84'
    if (options.crs !== 'SELF') {
      let resolutions = []
      for (let i = 0; i < 19; i++) {
        resolutions[i] = 256 * Math.pow(2, 18 - i)
      }
      this._tilingScheme = new BaiduMercatorTilingScheme({
        resolutions,
        rectangleSouthwestInMeters: new Cartesian2(
          -20037726.37,
          -12474104.17
        ),
        rectangleNortheastInMeters: new Cartesian2(
          20037726.37,
          12474104.17
        )
      })
    } else {
      this._tilingScheme = new WebMercatorTilingScheme({
        rectangleSouthwestInMeters: new Cartesian2(-33554054, -33746824),
        rectangleNortheastInMeters: new Cartesian2(33554054, 33746824)
      })
    }
    this._rectangle = this._tilingScheme.rectangle
    this._credit = undefined
    this._token = undefined
    this._style = options.style || 'normal'
  }

  get url() {
    return this._url
  }

  get token() {
    return this._token
  }

  get tileWidth() {
    if (!this.ready) {
      throw new DeveloperError(
        'tileWidth must not be called before the imagery provider is ready.'
      )
    }
    return this._tileWidth
  }

  get tileHeight() {
    if (!this.ready) {
      throw new DeveloperError(
        'tileHeight must not be called before the imagery provider is ready.'
      )
    }
    return this._tileHeight
  }

  get maximumLevel() {
    if (!this.ready) {
      throw new DeveloperError(
        'maximumLevel must not be called before the imagery provider is ready.'
      )
    }
    return this._maximumLevel
  }

  get minimumLevel() {
    if (!this.ready) {
      throw new DeveloperError(
        'minimumLevel must not be called before the imagery provider is ready.'
      )
    }
    return 0
  }

  get tilingScheme() {
    if (!this.ready) {
      throw new DeveloperError(
        'tilingScheme must not be called before the imagery provider is ready.'
      )
    }
    return this._tilingScheme
  }

  get rectangle() {
    if (!this.ready) {
      throw new DeveloperError(
        'rectangle must not be called before the imagery provider is ready.'
      )
    }
    return this._rectangle
  }

  get ready() {
    return !!this._url
  }

  get credit() {
    return this._credit
  }

  get hasAlphaChannel() {
    return true
  }

  getTileCredits(x: number, y: number, level: number) { }

  /**
   * Request Image
   * @param x
   * @param y
   * @param level
   * @returns {Promise<HTMLImageElement | HTMLCanvasElement>}
   */
  requestImage(x: number, y: number, level: number) {
    if (!this.ready) {
      throw new DeveloperError(
        'requestImage must not be called before the imagery provider is ready.'
      )
    }
    let xTiles = this._tilingScheme.getNumberOfXTilesAtLevel(level)
    let yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level)
    let url = this._url
      .replace('{z}', level.toString())
      .replace('{s}', String(1))
      .replace('{style}', this._style)
      .replace('{labelStyle}', this._labelStyle)
      .replace('{time}', String(new Date().getTime()))

    if (this._crs === 'WGS84') {
      url = url.replace('{x}', String(x)).replace('{y}', String(-y))
    } else {
      url = url
        .replace('{x}', String(x - xTiles / 2))
        .replace('{y}', String(yTiles / 2 - y - 1))
    }
    return ImageryProvider.loadImage(this as any, url)
  }
}

export default BaiduImageryProvider