<template>
    <div :id="containerName">
        <div class="tools"></div>
    </div>
</template>

<script setup lang="ts">
import { Cartesian3, GeoJsonDataSource, Viewer } from 'cesium';
import { ref, onMounted } from 'vue';
import { createViewer, VertexTool } from '../../libs';

const containerName = "cesium-container";
const viewer = ref<Viewer>();


onMounted(() => {
    viewer.value = createViewer(containerName);
    init(viewer.value);
})

function init(viewer: Viewer) {
    GeoJsonDataSource.load('../src/assets/geodata/single.geojson')
        .then(data => {
            data.entities.values.forEach(entity => {
                viewer.entities.add(entity);
            });
            
            viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(120.42533699835855, 31.07777035267323, 1000)
            });
        })


}
</script>

<style>
#cesium-container {
    height: 100vh;
}

.el-popover {
    position: fixed;
    z-index: 2;
}
</style>