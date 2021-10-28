<template>
  <el-container>
    <el-aside>
     <Menu></Menu>
    </el-aside>
    <el-main>
      <router-view />
    </el-main>
  </el-container>

  <!-- <el-container>
    <el-aside>
      <router-link :to="{ name: 'Home' }">Home</router-link>
      <router-link :to="{ name: 'Mark' }">Mark</router-link>
      <router-link :to="{ name: 'Mirror' }">Mirror</router-link>
      <router-link :to="{ name: 'SelfSpin' }">SelfSpin</router-link>
      <router-link :to="{ name: 'Thinning' }">Thinning</router-link>
      <router-link :to="{ name: 'VertexTool' }">VertexTool</router-link>
      <router-link :to="{ name: 'Weather' }">Weather</router-link>
    </el-aside>
    <el-main>
      
    </el-main>
  </el-container> -->
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
