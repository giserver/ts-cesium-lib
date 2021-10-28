<template>
   <div id="cesium-container"></div>
</template>

<script setup lang="ts">

import { onMounted } from 'vue-demi';
import { useRoute } from 'vue-router';
import {createViewer} from '../../libs'

const route = useRoute();

const mapType = route.params.type as string;

onMounted(()=>{
   createViewer("cesium-container");
})

</script>

<style>
#cesium-container{
   height:100vh;
}
</style>