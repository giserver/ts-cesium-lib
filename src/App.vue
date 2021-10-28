<template>
  <el-container>
    <el-aside>
     <Menu></Menu>
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">

import Menu from './components/Menu.vue'

</script>

<style>
body {
  margin: 0;
}

.el-aside {
  background-color: #d3dce6;
  max-width: 200px;
}

.el-main {
  background-color: #e9eef3;
  flex: 1;
  padding:0;
}

.el-container {
  display: flex;
  height: 100vh;
}
</style>
