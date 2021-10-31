<template>
    <div :id="containerName"></div>
</template>

<script setup lang="ts">
import { Cartesian3, GeoJsonDataSource, Viewer } from 'cesium';
import { ref, onMounted } from 'vue';
import { createViewer, EntityPicker,Popup } from '../../libs';

const containerName = "cesium-container";
const viewer = ref<Viewer>();

onMounted(() => {
    viewer.value = createViewer(containerName);
    init(viewer.value);
})

function init(viewer: Viewer) {
    let datasource = GeoJsonDataSource.load('../src/assets/geodata/single.geojson');
    viewer.dataSources.add(datasource);
    viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(120.42533699835855, 31.07777035267323, 1000)
    });

    let picker = new EntityPicker(viewer);
    let popup = new Popup(viewer);
    picker.start((entity,position) => {
        const element = document.createElement("div");
        element.innerHTML = entity.name || "test";
        popup.show(position,element);
    });
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