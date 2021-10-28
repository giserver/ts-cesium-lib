<template>
  <div id="cesium-container">
    <div id="tools" v-if="showSwitch">
      <el-switch
        v-model="isElectronicMap"
        inactive-text="卫星影像"
        active-text="电子地图"
        @click="changeMap"
      >
      </el-switch>
    </div>
  </div>
</template>

<script setup lang="ts">

import { MapboxStyleImageryProvider, UrlTemplateImageryProvider, Viewer, Cartesian3, Cesium3DTileset } from 'cesium';
import { onMounted, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createViewer, AmapImageryProvider, BaiduImageryProvider } from '../../libs'

const route = useRoute();
const router = useRouter();

const showSwitch = ref(true);
const isElectronicMap = ref(false);
let viewer: Viewer;
let mapType: string;

onMounted(() => {
  viewer = createViewer("cesium-container");
  mapType = route.params.type as string;
  changeMap();
})

watch(() => {
  return route.params.type;
}, (type, prevtype, onInvalidate) => {
  mapType = type as string;
  showSwitch.value = mapType === "0" || mapType === "1";

  changeMap();

  onInvalidate(() => {
  })
});

function changeMap() {

  //删除所有图层
  viewer.imageryLayers.removeAll();
  viewer.scene.primitives.removeAll();

  switch (mapType) {
    //加载高德地图
    case "0":
      viewer.imageryLayers.addImageryProvider(new AmapImageryProvider({
        style: isElectronicMap.value ? "elec" : "img",
        crs: 'WGS84'
      }))
      break;
    
    //加载百度地图
    case "1":
      viewer.imageryLayers.addImageryProvider(new BaiduImageryProvider({
        style: isElectronicMap.value ? "vec" : "img",
        crs: 'WGS84'
      }) as any)
      break;
    
    //加载自定义地图
    case "2":
      viewer.imageryLayers.addImageryProvider(new AmapImageryProvider({
        style: 'img',
        crs: 'WGS84'
      }))
      viewer.imageryLayers.addImageryProvider(new UrlTemplateImageryProvider({
        url: "https://szshsurvey.com/tiles/wxc/wx_zs/{z}/{x}/{y}.png"
      }));
      break;
    
    //加载mapbox地图
    case "3":
      viewer.imageryLayers.addImageryProvider(new MapboxStyleImageryProvider({
        url: 'https://api.mapbox.com/styles/v1',
        username: 'cocainecoder',
        styleId: 'cktp5pvhk1x3a17jqphiinsle',
        accessToken: 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w',
        scaleFactor: true
      }));
      break;
    
    case "4":
      viewer.imageryLayers.addImageryProvider(new AmapImageryProvider({
        style: 'elec',
        crs: 'WGS84'
      }))
      viewer.scene.primitives.add(new Cesium3DTileset({
        url: "https://szshsurvey.com/tiles/wxc/wx_mx1/tileset.json"
      }));
      break;

    //不要写任何逻辑，有可能是其他功能的路由
    default:
      break;
  }

  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(120.42417, 31.07852, 1000)
  })
}

</script>

<style>
#cesium-container {
  height: 100vh;
}

#tools {
  position: absolute;
  z-index: 2;
  right:0;
  margin: 10px;
  background-color:dimgray;
  padding: 10px;
}
</style>