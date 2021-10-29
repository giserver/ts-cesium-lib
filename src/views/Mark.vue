<template>
    <div :id="containerName">
        <div id="tools">
            <DrawTool :marker="marker"></DrawTool>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Viewer } from 'cesium';
import { onMounted, ref } from 'vue'
import { createViewer, Mark } from '../../libs';
import DrawTool from '../components/DrawTool.vue';

const containerName = "container"
const viewer = ref<Viewer>();
const marker = ref<Mark>();

onMounted(()=>{
    viewer.value = createViewer(containerName);
    marker.value = new Mark(viewer.value);
})

</script>

<style>
#container{
    height:100vh;
}

#tools {
  position: absolute;
  z-index: 2;
  right: 0;
  margin: 10px;
  background-color: #545c64;
  padding: 10px;
}
</style>
