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
  crs?:CrsType
}

class AmapImageryProvider extends UrlTemplateImageryProvider {
  constructor(options:AmapImageryProviderConstructorOptions) {
    let base:UrlTemplateImageryProvider.ConstructorOptions = {url:""};
    base.url = options.style === 'img'
        ? IMG_URL
        : options.style === 'cva' ? CVA_URL : ELEC_URL;
    
    base.subdomains = base.subdomains || ['01', '02', '03', '04'];

    if (options.crs === 'WGS84') {
      base.tilingScheme = new AmapMercatorTilingScheme();
    }

    super(base);
  }
}

export default AmapImageryProvider