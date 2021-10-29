<template>
  <div :id="containerName">
    <div id="tools">
      <SwitchMap v-if="viewer" :viewer="viewer"></SwitchMap>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Viewer } from 'cesium'
import SwitchMap from '../components/SwitchMap.vue'
import { createViewer } from '../../libs';

const containerName = "cesium-container";
const viewer = ref<Viewer>();

onMounted(() => {
  viewer.value = createViewer(containerName);
})

</script>

<style>
#cesium-container {
  height: 100vh;
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