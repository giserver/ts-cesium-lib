import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import Map from './views/Map.vue';
import Mark from './views/Mark.vue';
import Mirror from './views/Mirror.vue';
import SelfSpin from './views/SelfSpin.vue';
import Thinning from './views/Thinning.vue';
import VertexTool from './views/VertexTool.vue';
import Weather from './views/Weather.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/0' },
  {
    path: '/:type',
    name: "Home",
    component: Map,
  },
  {
    path: '/mark',
    name: "Mark",
    component: Mark,
  },
  {
    path: '/mirror',
    name: "Mirror",
    component: Mirror,
  },
  {
    path: '/selfspin',
    name: "SelfSpin",
    component: SelfSpin,
  },
  {
    path: '/thinning',
    name: "Thinning",
    component: Thinning,
  },
  {
    path: '/vertextool',
    name: "VertexTool",
    component: VertexTool,
  },
  {
    path: '/weather',
    name: "Weather",
    component: Weather,
  }
]


export default createRouter({
  // 指定路由模式
  history: createWebHistory(),
  // 路由地址
  routes
})