import { UrlTemplateImageryProvider } from 'cesium'
import AmapMercatorTilingScheme from '../tiling-scheme/AmapMercatorTilingScheme'

const IMG_URL =
  'https://webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'

const ELEC_URL =
  'https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'

const CVA_URL =
  'https://webst{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'

type AmapImageryProviderStyle = 'img' | 'cva' | 'elec';
type CrsType = 'WGS84' | 'SELF';

type AmapImageryProviderConstructorOptions = {
  style: AmapImageryProviderStyle,
  crs?:CrsType,
  base:UrlTemplateImageryProvider.ConstructorOptions
}

class AmapImageryProvider extends UrlTemplateImageryProvider {
  constructor(options:AmapImageryProviderConstructorOptions) {
    options.base['url'] =
      options.style === 'img'
        ? IMG_URL
        : options.style === 'cva'
        ? CVA_URL
        : ELEC_URL
    options.base['subdomains'] = options.base.subdomains || ['01', '02', '03', '04']
    if (options.crs === 'WGS84') {
      options.base['tilingScheme'] = new AmapMercatorTilingScheme()
    }
    super(options.base)
  }
}

export default AmapImageryProvider