import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import HomeVue from './views/Home.vue';
import LimitCamera from './views/LimitCamera.vue'
import Map from './views/Map.vue';
import Marker from './views/Marker.vue';
import Mirror from './views/Mirror.vue';
import SelfSpin from './views/SelfSpin.vue';
import Thinning from './views/Thinning.vue';
import VertexTool from './views/VertexTool.vue';
import Weather from './views/Weather.vue';
import DataShow from './views/DataShow.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'HomeVue',
    component: HomeVue,
  },
  {
    path: '/limitcamera',
    name: 'LimitCamera',
    component: LimitCamera,
  },
  {
    path: '/map',
    name: "Map",
    component: Map,
  },
  {
    path: '/marker',
    name: "Marker",
    component: Marker,
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
  },
  {
    path:'/datashow',
    name:"DataShow",
    component:DataShow
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', redirect: '/' },
]


export default createRouter({
  // 指定路由模式
  history: createWebHistory(),
  // 路由地址
  routes
})