<template>
    <div class="monitor-page">
        <div class="page-header">
            <h2>
                <el-icon>
                    <DataAnalysis />
                </el-icon>
                通道实时监控
            </h2>
            <el-button-group>
                <el-button :icon="VideoPause" @click="isPaused = !isPaused">
                    {{ isPaused ? '继续' : '暂停' }}
                </el-button>
                <el-button :icon="RefreshRight" @click="clearHistory">清除历史</el-button>
            </el-button-group>
        </div>

        <div class="monitor-grid">
            <!-- 摇杆通道监控 -->
            <el-card class="channel-card" v-for="ch in channels" :key="ch.id">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <TrendCharts />
                        </el-icon>
                        <span>{{ ch.name }}</span>
                        <el-tag :type="ch.active ? 'success' : 'info'" size="small">
                            {{ ch.active ? '活动' : '静止' }}
                        </el-tag>
                    </div>
                </template>

                <div class="channel-content">
                    <div class="value-display">
                        <div class="current-value" :class="{ active: ch.active }">
                            {{ formatValue(ch.value) }}
                        </div>
                        <div class="value-bar">
                            <div class="bar-fill" :style="{
                                width: `${getBarPercentage(ch.value)}%`,
                                background: getBarColor(ch.value)
                            }"></div>
                            <div class="bar-center"></div>
                        </div>
                    </div>

                    <div class="channel-stats">
                        <div class="stat-item">
                            <label>最小值</label>
                            <span>{{ formatValue(ch.min) }}</span>
                        </div>
                        <div class="stat-item">
                            <label>最大值</label>
                            <span>{{ formatValue(ch.max) }}</span>
                        </div>
                        <div class="stat-item">
                            <label>平均值</label>
                            <span>{{ formatValue(ch.avg) }}</span>
                        </div>
                    </div>

                    <!-- 简单的历史趋势图 -->
                    <div class="mini-chart">
                        <svg viewBox="0 0 200 60" preserveAspectRatio="none">
                            <polyline :points="getChartPoints(ch.history)" fill="none" :stroke="getBarColor(ch.value)"
                                stroke-width="2" />
                        </svg>
                    </div>
                </div>
            </el-card>

            <!-- EXCH 旋钮监控 -->
            <el-card class="channel-card exch-card">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Setting />
                        </el-icon>
                        <span>EXCH 额外通道</span>
                        <el-tag :type="store.exchValue !== 0 ? 'warning' : 'info'" size="small">
                            {{ store.exchValue !== 0 ? '调节中' : '零位' }}
                        </el-tag>
                    </div>
                </template>

                <div class="channel-content">
                    <div class="value-display">
                        <div class="current-value" :class="{ active: store.exchValue !== 0 }">
                            {{ formatValue(store.exchValue) }}
                        </div>
                        <div class="value-bar">
                            <div class="bar-fill" :style="{
                                width: `${getBarPercentage(store.exchValue)}%`,
                                background: '#e6a23c'
                            }"></div>
                            <div class="bar-center"></div>
                        </div>
                    </div>

                    <el-button type="danger" :icon="RefreshLeft" @click="store.resetExch()">
                        归零
                    </el-button>
                </div>
            </el-card>

            <!-- 开关状态监控 -->
            <el-card class="switch-card">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Switch />
                        </el-icon>
                        <span>开关状态监控</span>
                    </div>
                </template>

                <div class="switch-grid">
                    <div class="switch-item">
                        <label>SW1 拨杆</label>
                        <div class="switch-states">
                            <div v-for="state in ['U', 'M', 'D']" :key="state" class="state-indicator"
                                :class="{ active: store.sw1State === state }">
                                {{ state }}
                            </div>
                        </div>
                    </div>

                    <div class="switch-item">
                        <label>SW2 拨杆</label>
                        <div class="switch-states">
                            <div v-for="state in ['U', 'M', 'D']" :key="state" class="state-indicator"
                                :class="{ active: store.sw2State === state }">
                                {{ state }}
                            </div>
                        </div>
                    </div>

                    <el-divider />

                    <div class="button-states">
                        <div v-for="btn in buttons" :key="btn.id" class="button-indicator"
                            :class="{ active: btn.pressed }">
                            <el-icon v-if="btn.pressed">
                                <CircleCheckFilled />
                            </el-icon>
                            <el-icon v-else>
                                <CircleClose />
                            </el-icon>
                            <span>{{ btn.label }}</span>
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 摇杆按压监控 -->
            <el-card class="joystick-press-card">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Pointer />
                        </el-icon>
                        <span>摇杆按压状态</span>
                    </div>
                </template>

                <div class="joystick-press-grid">
                    <div class="press-item" :class="{ active: store.leftJoystickPressed }">
                        <div class="press-circle"></div>
                        <span>左摇杆</span>
                    </div>
                    <div class="press-item" :class="{ active: store.rightJoystickPressed }">
                        <div class="press-circle"></div>
                        <span>右摇杆</span>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
    DataAnalysis, TrendCharts, VideoPause, RefreshRight, RefreshLeft,
    Setting, Switch, CircleCheckFilled, CircleClose, Pointer
} from '@element-plus/icons-vue'
import { useRemoteControlStore } from '../stores/remoteControl'

const store = useRemoteControlStore()
const isPaused = ref(false)

// 通道数据
const channels = ref([
    { id: 1, name: 'CH1 (左摇杆 X轴)', value: 0, min: 0, max: 0, avg: 0, history: [0], active: false },
    { id: 2, name: 'CH2 (左摇杆 Y轴)', value: 0, min: 0, max: 0, avg: 0, history: [0], active: false },
    { id: 3, name: 'CH3 (右摇杆 X轴)', value: 0, min: 0, max: 0, avg: 0, history: [0], active: false },
    { id: 4, name: 'CH4 (右摇杆 Y轴)', value: 0, min: 0, max: 0, avg: 0, history: [0], active: false }
])

const buttons = computed(() => [
    { id: 1, label: 'K1', pressed: store.k1Pressed },
    { id: 2, label: 'K2', pressed: store.k2Pressed },
    { id: 3, label: 'K3', pressed: store.k3Pressed },
    { id: 4, label: 'K4', pressed: store.k4Pressed }
])

let updateInterval = null

function formatValue(val) {
    const sign = val >= 0 ? '+' : ''
    return sign + val
}

function getBarPercentage(val) {
    return ((val + 660) / 1320) * 100
}

function getBarColor(val) {
    const abs = Math.abs(val)
    if (abs < 200) return '#67c23a'
    if (abs < 400) return '#409eff'
    if (abs < 550) return '#e6a23c'
    return '#f56c6c'
}

function getChartPoints(history) {
    if (!history || history.length === 0) return '0,60 200,60'
    if (history.length === 1) return `0,60 200,60`

    const points = history.map((val, idx) => {
        const x = (idx / (history.length - 1)) * 200
        const y = 60 - ((val + 660) / 1320) * 60
        return `${x},${y}`
    })

    return points.join(' ')
}

function updateChannels() {
    if (isPaused.value) return

    const channelValues = [store.ch1, store.ch2, store.ch3, store.ch4]

    channels.value.forEach((ch, idx) => {
        const newValue = channelValues[idx]
        ch.value = newValue
        ch.active = Math.abs(newValue) > 10

        // 更新统计
        if (ch.history.length === 0) {
            ch.min = newValue
            ch.max = newValue
        } else {
            ch.min = Math.min(ch.min, newValue)
            ch.max = Math.max(ch.max, newValue)
        }

        // 更新历史(保留最近50个点)
        ch.history.push(newValue)
        if (ch.history.length > 50) {
            ch.history.shift()
        }

        // 计算平均值
        ch.avg = Math.round(ch.history.reduce((a, b) => a + b, 0) / ch.history.length)
    })
}

function clearHistory() {
    channels.value.forEach(ch => {
        ch.history = []
        ch.min = ch.value
        ch.max = ch.value
        ch.avg = ch.value
    })
}

onMounted(() => {
    updateInterval = setInterval(updateChannels, 100) // 10Hz 更新频率
})

onUnmounted(() => {
    if (updateInterval) {
        clearInterval(updateInterval)
    }
})
</script>

<style scoped>
.monitor-page {
    min-height: 100vh;
    padding: 24px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

.monitor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
    max-width: 1600px;
    margin: 0 auto;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
}

.channel-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.value-display {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.current-value {
    font-size: 48px;
    font-family: 'Courier New', monospace;
    font-weight: 700;
    text-align: center;
    color: #909399;
    transition: all 0.3s;
}

.current-value.active {
    color: #409eff;
    text-shadow: 0 0 20px rgba(64, 158, 255, 0.5);
}

.value-bar {
    position: relative;
    height: 24px;
    background: linear-gradient(90deg, #f56c6c 0%, #67c23a 50%, #f56c6c 100%);
    border-radius: 12px;
    overflow: hidden;
    opacity: 0.2;
}

.bar-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    transition: width 0.1s, background 0.3s;
    opacity: 0.8;
}

.bar-center {
    position: absolute;
    left: 50%;
    top: 0;
    width: 2px;
    height: 100%;
    background: #303133;
    transform: translateX(-50%);
}

.channel-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    background: #f5f7fa;
    border-radius: 6px;
}

.stat-item label {
    font-size: 12px;
    color: #909399;
}

.stat-item span {
    font-size: 16px;
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #303133;
}

.mini-chart {
    height: 60px;
    background: #f5f7fa;
    border-radius: 6px;
    padding: 4px;
}

.mini-chart svg {
    width: 100%;
    height: 100%;
}

.switch-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.switch-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.switch-item label {
    font-weight: 600;
    color: #606266;
}

.switch-states {
    display: flex;
    gap: 8px;
}

.state-indicator {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    border: 2px solid #dcdfe6;
    border-radius: 6px;
    font-weight: 600;
    color: #909399;
    transition: all 0.3s;
}

.state-indicator.active {
    background: #409eff;
    border-color: #409eff;
    color: #fff;
    box-shadow: 0 0 16px rgba(64, 158, 255, 0.5);
}

.button-states {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.button-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;
    font-size: 24px;
    color: #909399;
    transition: all 0.3s;
}

.button-indicator.active {
    background: #67c23a;
    color: #fff;
    box-shadow: 0 0 16px rgba(103, 194, 58, 0.5);
}

.button-indicator span {
    font-size: 14px;
    font-weight: 600;
}

.joystick-press-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.press-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: #f5f7fa;
    border-radius: 8px;
    transition: all 0.3s;
}

.press-item.active {
    background: #409eff;
    color: #fff;
    box-shadow: 0 0 20px rgba(64, 158, 255, 0.5);
}

.press-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #dcdfe6;
    transition: all 0.3s;
}

.press-item.active .press-circle {
    background: #fff;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.press-item span {
    font-weight: 600;
    font-size: 16px;
}
</style>
