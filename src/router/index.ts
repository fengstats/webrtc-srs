import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/components/home.vue'),
  },
  {
    path: '/webrtc',
    component: () => import('@/components/webrtc-push-srs.vue'),
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
