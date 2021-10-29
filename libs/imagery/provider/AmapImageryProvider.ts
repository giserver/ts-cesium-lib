import { UrlTemplateImageryProvider } from 'cesium'
import AmapMercatorTilingScheme from '../tiling-scheme/AmapMercatorTilingScheme'
import { CustomProviderStyle, AMAP_IMG_URL, AMAP_ELEC_URL, CrsType } from '../ProviderStyle';

type AmapImageryProviderConstructorOptions = {
  style: CustomProviderStyle,
  crs?: CrsType
}

class AmapImageryProvider extends UrlTemplateImageryProvider {
  constructor(options: AmapImageryProviderConstructorOptions) {
    let base: UrlTemplateImageryProvider.ConstructorOptions = { url: "" };

    base.url = options.style === 'img' ? AMAP_IMG_URL : AMAP_ELEC_URL;
    base.subdomains = base.subdomains || ['01', '02', '03', '04'];

    if (options.crs !== 'SELF') {
      base.tilingScheme = new AmapMercatorTilingScheme();
    }

    super(base);
  }
}

export default AmapImageryProvider