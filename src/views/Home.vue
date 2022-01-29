<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Editor from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

const text = ref("");

onMounted(() => {
  fetch("https://raw.githubusercontent.com/ts-gis/ts-cesium-lib/main/README.md", { method: "GET" }).then(res => {
    res.text().then(val => {
      text.value = val;
    })
  })
})

</script>

<template>
  <editor v-model="text" theme="light" previewOnly style="padding: 20px;"></editor>
</template>

<style>
</style>
