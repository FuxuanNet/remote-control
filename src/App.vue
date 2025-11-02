<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Monitor, Connection, DataAnalysis, Setting,
  Expand, Fold
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

const menuItems = [
  { path: '/', icon: Monitor, title: '主控制面板' },
  { path: '/connection', icon: Connection, title: '连接管理' },
  { path: '/monitor', icon: DataAnalysis, title: '通道监控' },
  { path: '/settings', icon: Setting, title: '系统设置' }
]

function handleMenuSelect(path) {
  router.push(path)
}
</script>

<template>
  <div class="app-container">
    <el-container>
      <!-- 侧边导航栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="sidebar">
          <div class="logo-section">
            <div class="logo">
              <el-icon>
                <Monitor />
              </el-icon>
            </div>
            <h1 v-show="!isCollapse" class="logo-text">DIYRC</h1>
          </div>

          <el-menu :default-active="route.path" :collapse="isCollapse" :collapse-transition="false"
            @select="handleMenuSelect">
            <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <template #title>{{ item.title }}</template>
            </el-menu-item>
          </el-menu>

          <div class="collapse-trigger" @click="isCollapse = !isCollapse">
            <el-icon v-if="isCollapse">
              <Expand />
            </el-icon>
            <el-icon v-else>
              <Fold />
            </el-icon>
          </div>
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.el-container {
  height: 100%;
}

.el-aside {
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  transition: width 0.3s;
  overflow-x: hidden;
}

.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(145deg, #409eff, #337ecc);
  border-radius: 12px;
  font-size: 28px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.el-menu {
  flex: 1;
  border: none;
  background: transparent;
}

:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s;
}

:deep(.el-menu-item:hover) {
  background: rgba(64, 158, 255, 0.1) !important;
  color: #409eff;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.2), transparent) !important;
  color: #409eff;
  border-right: 3px solid #409eff;
}

:deep(.el-menu-item .el-icon) {
  font-size: 20px;
}

.collapse-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-trigger:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

.collapse-trigger .el-icon {
  font-size: 20px;
}

.el-main {
  padding: 0;
  overflow-y: auto;
  background: #f5f7fa;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 滚动条样式 */
:deep(.el-main::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.el-main::-webkit-scrollbar-track) {
  background: #f5f7fa;
}

:deep(.el-main::-webkit-scrollbar-thumb) {
  background: #dcdfe6;
  border-radius: 4px;
}

:deep(.el-main::-webkit-scrollbar-thumb:hover) {
  background: #c0c4cc;
}
</style>
