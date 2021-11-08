<template>
    <div :id="containerName">
        <div class="tools">
            <el-select-v2
                v-if="viewer"
                v-model="value"
                style="width: 240px"
                size="medium"
                filterable
                clearable
                remote
                :remote-method="remoteMethod"
                :options="options"
                :loading="loading"
                placeholder="请输入名称"
                @change="handleSelectChange"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { BoundingSphere, CameraEventType, Cartesian3, GeoJsonDataSource, JulianDate, KeyboardEventModifier, SceneTransforms, ScreenSpaceEventHandler, ScreenSpaceEventType, Viewer } from 'cesium';
import { ref, onMounted } from 'vue';
import { createViewer, EntityPicker, Popup } from '../../libs';

const containerName = "cesium-container";
const viewer = ref<Viewer>();
let popup: Popup;

const value = ref('');
const options = ref<Array<any>>([]);
const loading = ref(false)

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
    popup = new Popup(viewer);
    picker.start((entity, position) => {
        const element = document.createElement("div");
        element.innerHTML = parseData2Html(entity.properties?.getValue(JulianDate.now()));
        popup.show(position, element);
    });
}

function parseData2Html(data: any) {
    return `<div>名称 : ${data.name}</div>
            <div>描述 : ${data.description}</div>
            <div>数量 : ${data.count}</div>
            <div>类型 : ${data.type}</div>
            <div>建成时间 : ${data.create_time}</div>
            <div>高度 : ${data.height}</div>
            <div>需要重建 : ${data.need_rebuild}</div>`
}

function remoteMethod(query: string) {
    loading.value = true;
    if (query !== '' && viewer.value) {
        let entities = viewer.value.dataSources.get(0).entities.values.filter(entity => {
            var name = entity.name?.trim().toLocaleLowerCase();
            return name && name.startsWith(query.trim().toLocaleLowerCase());
        });

        options.value = entities.map(x => { return { value: x.id, label: `${x.name}` } });
    } else {
        options.value = [];
    }
    loading.value = false;
}

function handleSelectChange() {
    let entity = viewer.value?.dataSources.get(0).entities.getById(value.value);
    if (viewer.value && entity) {
        const element = document.createElement("div");
        element.innerHTML = parseData2Html(entity.properties?.getValue(JulianDate.now()));
        var position = BoundingSphere.fromPoints(entity.polygon?.hierarchy?.getValue(JulianDate.now()).positions).center;
        if (position) {
            popup.show(SceneTransforms.wgs84ToWindowCoordinates(viewer.value.scene, position), element);
        }
    }
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