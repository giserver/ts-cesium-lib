<template>
    <div id = "container_mirror_group">
        <div class="container" :id="container_master">
            <div id="tools1">
                <SwitchMap v-if="viewer_master" :viewer="viewer_master"></SwitchMap>
                <el-divider></el-divider>
                <DrawTool v-if="marker" :marker="marker"></DrawTool>
            </div>
        </div>
        <div class="container" :id="container_slave">
            <div id = "tools2">
                <SwitchMap v-if="viewer_slave" :viewer="viewer_slave"></SwitchMap>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Viewer } from 'cesium';
import { onMounted, ref } from 'vue'
import { createViewer, Marker, Mirror} from '../../libs';
import SwitchMap from '../components/SwitchMap.vue';
import DrawTool from '../components/DrawTool.vue';
import { Mark } from 'element-plus';

const container_master = "container_master";
const container_slave = "container_slave";

let viewer_master = ref<Viewer>();
let viewer_slave = ref<Viewer>();
let marker = ref<Marker>();

onMounted(() => {
    viewer_master.value = createViewer(container_master);
    viewer_slave.value = createViewer(container_slave);

    new Mirror(viewer_master.value,viewer_slave.value)
    marker.value = new Marker(viewer_master.value,(type,entity)=>viewer_slave.value?.entities.add(entity));
})

</script>

<style>
#container_mirror_group{
    display: flex;
}

.container{
    flex: 1;
    height:100vh;
}

#tools1 {
  position: absolute;
  z-index: 2;
  margin: 10px;
  background-color: #545c64;
  padding: 10px;
}

#tools2 {
  position: absolute;
  z-index: 2;
  right: 0;
  margin: 10px;
  background-color: #545c64;
  padding: 10px;
}
</style>