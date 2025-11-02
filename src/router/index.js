import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'control',
      component: () => import('../views/ControlPanel.vue'),
      meta: { title: '主控制面板' }
    },
    {
      path: '/connection',
      name: 'connection',
      component: () => import('../views/ConnectionStatus.vue'),
      meta: { title: '连接管理' }
    },
    {
      path: '/monitor',
      name: 'monitor',
      component: () => import('../views/ChannelMonitor.vue'),
      meta: { title: '通道监控' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
      meta: { title: '系统设置' }
    }
  ]
})

export default router
