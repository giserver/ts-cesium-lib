<template>
    <div id="container"></div>
</template>

<script setup lang="ts">
import { Cartesian3, Cesium3DTileset } from 'cesium';
import { onMounted } from 'vue'
import { createViewer, setMaxPitch } from '../../libs';

onMounted(() => {
    let viewer = createViewer("container");
    let tile = new Cesium3DTileset({
        url: "https://szshsurvey.com/tiles/lyc/moxing/lyc_mx1/tileset.json"
    });
    viewer.scene.primitives.add(tile);
    viewer.scene.primitives.add(new Cesium3DTileset({
        url: 'https://szshsurvey.com/tiles/lyc/moxing/lyc_mx2/tileset.json'
    }))

    viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(120.521552,31.253368, 500)
    })

    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 500
    setMaxPitch(viewer,-0.5)
})

</script>

<style scoped>
#container {
    height: 100vh;
    width: 100%;
}
</style>