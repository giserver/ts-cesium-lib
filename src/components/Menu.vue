<template>
  <el-menu
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="el-menu-vertical-demo"
    default-active="2"
    text-color="#fff"
    :unique-opened="true"
    :router="true"
  >
    <!--公司logo 点击跳转吉埃思官网-->
    <el-menu-item index="1" @click="handleOpenUrl('/home')">
      <i class="el-icon-s-home"></i>
      <span>jas-cesium-lib</span>
    </el-menu-item>

    <!--功能路由-->
    <el-sub-menu
      v-for="(routerGroup, index_group) in routerGroups"
      :key="index_group"
      :index="`${index_group + 2}`"
    >
      <template #title>
        <i :class="routerGroup.title.icon"></i>
        <span>{{ routerGroup.title.name }}</span>
      </template>

      <el-menu-item
        v-for="(item, index_item) in routerGroup.items"
        :key="index_item"
        :index="item.href"
      >{{ item.name }}</el-menu-item>
    </el-sub-menu>

    <svg
      height="32"
      aria-hidden="true"
      viewBox="0 0 16 16"
      version="1.1"
      width="32"
      data-view-component="true"
      class="octicon octicon-mark-github v-align-middle"
      id="github"
      @click="handleOpenUrl('https://github.com/ts-gis/ts-cesium-lib',true)"
    >
      <path
        fill-rule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  </el-menu>
</template>

<script setup lang="ts">

import { routerGroups } from '../contracts/UIData'

const handleOpenUrl = (url: string, newWindow: boolean = false) => {
  if (newWindow)
    window.open(url);
  else
    window.location.href = "/home"
}

</script>

<style>
.el-menu {
  height: 100%;
}

.company-img {
  width: 40px;
}

#github {
  position: absolute;
  bottom: 0;
  margin: 0 0 10px 15px;
  cursor: pointer;
}
</style>