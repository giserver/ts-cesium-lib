type CustomProviderStyle = 'img' | 'elec';
type CrsType = 'WGS84' | 'SELF';

const BMAP_IMG_URL = 'http://shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46';

const BMAP_ELEC_URL = 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1';

const AMAP_IMG_URL = 'https://webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';

const AMAP_ELEC_URL = 'https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';


export {
    BMAP_IMG_URL,
    BMAP_ELEC_URL,
    AMAP_IMG_URL,
    AMAP_ELEC_URL
}

export type {
    CustomProviderStyle,
    CrsType
}