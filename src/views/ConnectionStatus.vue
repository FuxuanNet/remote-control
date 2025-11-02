<template>
    <div class="connection-page">
        <div class="page-header">
            <h2>
                <el-icon>
                    <Link />
                </el-icon>
                无线连接管理
            </h2>
        </div>

        <div class="connection-grid">
            <!-- 连接状态卡片 -->
            <el-card class="status-card">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Connection />
                        </el-icon>
                        <span>连接状态</span>
                    </div>
                </template>

                <div class="status-content">
                    <div class="status-indicator">
                        <div class="status-icon" :class="{
                            connected: store.isConnected,
                            pairing: store.isPairing,
                            disconnected: !store.isConnected && !store.isPairing
                        }">
                            <el-icon v-if="store.isConnected">
                                <CircleCheckFilled />
                            </el-icon>
                            <el-icon v-else-if="store.isPairing">
                                <Loading />
                            </el-icon>
                            <el-icon v-else>
                                <CircleCloseFilled />
                            </el-icon>
                        </div>
                        <div class="status-text">
                            <h3>{{ connectionStatusText }}</h3>
                            <p>{{ connectionDetailText }}</p>
                        </div>
                    </div>

                    <el-divider />

                    <div class="connection-info">
                        <div class="info-item">
                            <label>信号强度</label>
                            <el-progress :percentage="store.signalStrength" :color="signalColor"
                                :status="store.isConnected ? null : 'exception'" />
                        </div>
                        <div class="info-item">
                            <label>当前通道</label>
                            <el-tag size="large" type="primary">CH {{ store.currentChannel }}</el-tag>
                        </div>
                        <div class="info-item">
                            <label>连接模式</label>
                            <el-tag size="large" type="info">Dbus 2.4GHz</el-tag>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <el-button type="primary" size="large" :icon="Connection" :loading="store.isPairing"
                            :disabled="store.isConnected" @click="handlePairing">
                            {{ store.isPairing ? '对频中...' : '开始对频' }}
                        </el-button>
                        <el-button type="danger" size="large" :icon="Close" :disabled="!store.isConnected"
                            @click="handleDisconnect">
                            断开连接
                        </el-button>
                    </div>
                </div>
            </el-card>

            <!-- 对频说明卡片 -->
            <el-card class="guide-card">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Document />
                        </el-icon>
                        <span>对频操作指南</span>
                    </div>
                </template>

                <el-steps direction="vertical" :active="currentStep" finish-status="success">
                    <el-step title="准备设备">
                        <template #description>
                            <p>确保遥控器和接收器都已开机</p>
                            <p class="warning-text">
                                <el-icon>
                                    <Warning />
                                </el-icon>
                                确保周围无其他遥控器干扰
                            </p>
                        </template>
                    </el-step>

                    <el-step title="按下对频键">
                        <template #description>
                            <p>按住接收器上的对频按键2秒</p>
                            <p>指示灯开始慢闪,表示进入对频模式</p>
                        </template>
                    </el-step>

                    <el-step title="启动软件对频">
                        <template #description>
                            <p>点击"开始对频"按钮</p>
                            <p>等待1-2分钟完成配对</p>
                        </template>
                    </el-step>

                    <el-step title="对频成功">
                        <template #description>
                            <p>指示灯快闪表示连接成功</p>
                            <p class="success-text">
                                <el-icon>
                                    <CircleCheckFilled />
                                </el-icon>
                                可以开始使用遥控器
                            </p>
                        </template>
                    </el-step>
                </el-steps>
            </el-card>

            <!-- 设备信息卡片 -->
            <el-card class="device-card">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>设备信息</span>
                    </div>
                </template>

                <div class="device-info">
                    <div class="device-item">
                        <el-icon class="device-icon">
                            <Cpu />
                        </el-icon>
                        <div class="device-details">
                            <h4>无线模块</h4>
                            <p>NRF24L01 / LoRa SX1278</p>
                            <el-tag size="small" type="success">正常</el-tag>
                        </div>
                    </div>

                    <el-divider />

                    <div class="device-specs">
                        <div class="spec-item">
                            <label>频率范围</label>
                            <span>2.4GHz ISM</span>
                        </div>
                        <div class="spec-item">
                            <label>传输距离</label>
                            <span>≥ 100m</span>
                        </div>
                        <div class="spec-item">
                            <label>接口类型</label>
                            <span>Dbus</span>
                        </div>
                        <div class="spec-item">
                            <label>电源</label>
                            <span>5V / 3.3V</span>
                        </div>
                    </div>

                    <el-divider />

                    <div class="led-status">
                        <h4>指示灯状态说明</h4>
                        <div class="led-item">
                            <div class="led-demo slow-blink"></div>
                            <span>慢闪 - 对频模式</span>
                        </div>
                        <div class="led-item">
                            <div class="led-demo fast-blink"></div>
                            <span>快闪 - 已连接</span>
                        </div>
                        <div class="led-item">
                            <div class="led-demo off"></div>
                            <span>熄灭 - 未通电</span>
                        </div>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
    Link, Connection, CircleCheckFilled, CircleCloseFilled, Loading,
    Close, Document, Warning, Monitor, Cpu
} from '@element-plus/icons-vue'
import { useRemoteControlStore } from '../stores/remoteControl'

const store = useRemoteControlStore()
const currentStep = ref(0)

const connectionStatusText = computed(() => {
    if (store.isPairing) return '对频中'
    if (store.isConnected) return '已连接'
    return '未连接'
})

const connectionDetailText = computed(() => {
    if (store.isPairing) return '正在搜索遥控器信号,请耐心等待...'
    if (store.isConnected) return '遥控器已成功连接,可以正常使用'
    return '请点击"开始对频"按钮连接遥控器'
})

const signalColor = computed(() => {
    if (store.signalStrength >= 70) return '#67c23a'
    if (store.signalStrength >= 40) return '#e6a23c'
    return '#f56c6c'
})

async function handlePairing() {
    currentStep.value = 2

    ElNotification({
        title: '开始对频',
        message: '正在搜索遥控器信号,请确保接收器已进入对频模式',
        type: 'info',
        duration: 3000
    })

    const success = await store.startPairing()

    if (success) {
        currentStep.value = 3
        ElNotification({
            title: '对频成功',
            message: '遥控器已成功连接,可以开始使用',
            type: 'success',
            duration: 3000
        })
    } else {
        currentStep.value = 1
        ElNotification({
            title: '对频失败',
            message: '未能找到遥控器信号,请检查设备并重试',
            type: 'error',
            duration: 3000
        })
    }
}

function handleDisconnect() {
    store.isConnected = false
    store.signalStrength = 0
    currentStep.value = 0
    ElMessage.info('已断开连接')
}
</script>

<style scoped>
.connection-status {
    min-height: 100vh;
    padding: 24px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.page-header {
    margin-bottom: 24px;
    padding: 20px 32px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-size: 24px;
    color: #303133;
}

.connection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
}

.status-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 24px;
}

.status-icon {
    font-size: 64px;
    transition: all 0.3s;
}

.status-icon.connected {
    color: #67c23a;
}

.status-icon.pairing {
    color: #409eff;
    animation: rotate 2s linear infinite;
}

.status-icon.disconnected {
    color: #909399;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.status-text h3 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #303133;
}

.status-text p {
    margin: 0;
    color: #606266;
    line-height: 1.6;
}

.connection-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.info-item label {
    font-weight: 600;
    color: #606266;
    min-width: 80px;
}

.action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 16px;
}

.warning-text {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e6a23c;
    margin-top: 8px;
}

.success-text {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #67c23a;
    margin-top: 8px;
}

.device-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.device-item {
    display: flex;
    align-items: center;
    gap: 16px;
}

.device-icon {
    font-size: 48px;
    color: #409eff;
}

.device-details h4 {
    margin: 0 0 8px 0;
    color: #303133;
}

.device-details p {
    margin: 0 0 8px 0;
    color: #606266;
    font-size: 14px;
}

.device-specs {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.spec-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
}

.spec-item label {
    font-weight: 600;
    color: #606266;
}

.spec-item span {
    color: #303133;
    font-family: 'Courier New', monospace;
}

.led-status h4 {
    margin: 0 0 16px 0;
    color: #303133;
}

.led-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.led-demo {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #67c23a;
}

.led-demo.slow-blink {
    animation: blink-slow 2s infinite;
}

.led-demo.fast-blink {
    animation: blink-fast 0.5s infinite;
}

.led-demo.off {
    background: #dcdfe6;
}

@keyframes blink-slow {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.2;
    }
}

@keyframes blink-fast {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.3;
    }
}
</style>
