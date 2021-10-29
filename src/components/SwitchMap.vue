<template>
  <el-switch v-model="isElec" inactive-text="卫星影像" active-text="电子地图" @click="changeMap"></el-switch>
  <el-radio-group v-model="mapProvider" @change="changeMap">
    <el-row v-for="(control,index) in mapControls">
      <el-radio :key="index" :label="control.provider">{{ control.name }}</el-radio>
    </el-row>
  </el-radio-group>
</template>

<script setup lang="ts">
import { Viewer, UrlTemplateImageryProvider, Cesium3DTileset, MapboxStyleImageryProvider, Cartesian3 } from 'cesium';
import { defineProps, ref, onMounted } from 'vue';
import { AmapImageryProvider, BaiduImageryProvider, CustomProviderStyle } from '../../libs';

type MapProvider = 'amap' | 'bdmap' | 'custom' | 'mapbox' | '3dtiles';

const props = defineProps({
  viewer: Viewer,
})

const isElec = ref<boolean>(false);
const mapProvider = ref<MapProvider>('amap');

onMounted(() => {
  if (props.viewer)
    changeMap();
})

const mapControls: Array<{ name: string, provider: MapProvider }> = [
  {
    name: "高德地图",
    provider: "amap",
  },
  {
    name: "百度地图",
    provider: "bdmap",
  },
  {
    name: "自定义",
    provider: "custom",
  },
  {
    name: "倾斜摄影",
    provider: "3dtiles"
  },
  {
    name: "mapbox",
    provider: "mapbox",
  },
]

function changeMap() {

  const viewer = props.viewer;
  if (!viewer) return;

  const type: CustomProviderStyle = isElec.value ? 'elec' : 'img';
  const provider = mapProvider.value;

  //删除所有图层
  viewer.imageryLayers.removeAll();
  viewer.scene.primitives.removeAll();

  switch (provider) {
    //加载高德地图
    case 'amap':
      viewer.imageryLayers.addImageryProvider(new AmapImageryProvider({
        style: type
      }))
      break;

    //加载百度地图
    case 'bdmap':
      viewer.imageryLayers.addImageryProvider(new BaiduImageryProvider({
        style: type
      }) as any)
      break;

    //加载自定义地图
    case 'custom':
      viewer.imageryLayers.addImageryProvider(new AmapImageryProvider({
        style: type
      }))
      viewer.imageryLayers.addImageryProvider(new UrlTemplateImageryProvider({
        url: "https://szshsurvey.com/tiles/wxc/wx_zs/{z}/{x}/{y}.png"
      }));
      break;

    //加载倾斜摄影数据
    case '3dtiles':
      viewer.imageryLayers.addImageryProvider(new AmapImageryProvider({
        style: type,
      }))
      viewer.scene.primitives.add(new Cesium3DTileset({
        url: "https://szshsurvey.com/tiles/wxc/wx_mx1/tileset.json"
      }));
      break;

    //加载mapbox地图
    case 'mapbox':
      viewer.imageryLayers.addImageryProvider(new MapboxStyleImageryProvider({
        url: 'https://api.mapbox.com/styles/v1',
        username: 'cocainecoder',
        styleId: 'cktp5pvhk1x3a17jqphiinsle',
        accessToken: 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w',
        scaleFactor: true
      }));
      break;

    default:
      console.error(`地图加载出错，没有找到合适的底图 provider = ${provider}`);
      break;
  }

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(120.42417, 31.07852, 2000)
  })
}

</script>

<style>
.el-radio {
  color: black;
}
</style>