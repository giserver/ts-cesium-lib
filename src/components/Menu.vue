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
    <el-menu-item index="1" @click="handleCompanyClick">
      <img class="company-img" src="../assets/img/company.png" />
      <span>吉埃思信息科技</span>
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
      >
        {{ item.name }}
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">

interface RouterGroup {
  title: RouterGroupTitle,
  items: Array<RouterGroupItem>
}

interface RouterGroupTitle {
  name: string;
  icon: string;
}

interface RouterGroupItem {
  name: string;
  href: string;
}

const routerGroups: Array<RouterGroup> = [{
  title: {
    name: "地图加载",
    icon: "el-icon-picture"
  },
  items: [
    {
      name: "底图加载",
      href: "/map"
    },
    {
      name:"双屏对比",
      href: '/mirror'
    }
  ]
}, {
  title: {
    name: "编辑功能",
    icon: "el-icon-edit"
  },
  items: [
    {
      name: "点线面绘制",
      href: "/mark"
    },
    {
      name: "顶点工具",
      href: "/vertextool"
    }
  ]
}]

const handleCompanyClick = () => {
  window.open("http://www.szjiaisi.com", "_blank")
}

</script>

<style>
.el-menu {
  height: 100%;
}

.company-img {
  width: 40px;
}
</style>