<template>
    <div class="control-panel">
        <div class="panel-header">
            <h2 class="panel-title">
                <el-icon>
                    <Monitor />
                </el-icon>
                遥控器主控制面板
            </h2>
            <div class="status-bar">
                <el-tag :type="store.isConnected ? 'success' : 'danger'" effect="dark">
                    <el-icon>
                        <Connection />
                    </el-icon>
                    {{ store.isConnected ? '已连接' : '未连接' }}
                </el-tag>
                <el-tag type="info" effect="plain">
                    <el-icon>
                        <Pointer />
                    </el-icon>
                    {{ store.batteryLevel }}%
                </el-tag>
                <el-tag v-if="store.isTempWarning" type="warning" effect="dark">
                    <el-icon>
                        <Warning />
                    </el-icon>
                    高温警告
                </el-tag>
            </div>
        </div>

        <div class="control-layout">
            <!-- 左侧控制区 -->
            <div class="left-section">
                <!-- 左摇杆 -->
                <Joystick label="左摇杆" x-label="CH1" y-label="CH2" v-model:model-value-x="store.ch1"
                    v-model:model-value-y="store.ch2" @press="store.leftJoystickPressed = true"
                    @release="store.leftJoystickPressed = false" />

                <!-- 左侧按键 -->
                <div class="button-group">
                    <ControlButton label="K1" v-model="store.k1Pressed" />
                    <ControlButton label="K2" v-model="store.k2Pressed" />
                </div>

                <!-- SW1 开关 -->
                <ThreeWaySwitch label="SW1" v-model="store.sw1State" />

                <!-- EXCH- 旋钮 -->
                <RotaryKnob label="EXCH -" v-model="exchMinus" :show-reset="true" @reset="handleExchMinusReset" />
            </div>

            <!-- 中央显示区 -->
            <div class="center-section">
                <LCDDisplay :ch1="store.ch1" :ch2="store.ch2" :ch3="store.ch3" :ch4="store.ch4"
                    :left-pressed="store.leftJoystickPressed" :right-pressed="store.rightJoystickPressed"
                    :k1="store.k1Pressed" :k2="store.k2Pressed" :k3="store.k3Pressed" :k4="store.k4Pressed"
                    :sw1="store.sw1State" :sw2="store.sw2State" :exch="store.exchValue" :connected="store.isConnected"
                    :channel="store.currentChannel" />

                <!-- 控制按钮组 -->
                <div class="control-actions">
                    <el-button type="danger" :icon="RefreshLeft" @click="handleReset" size="large">
                        系统复位
                    </el-button>
                    <el-button type="primary" :icon="Connection" @click="handleToggleConnection" size="large">
                        {{ store.isConnected ? '断开连接' : '开始连接' }}
                    </el-button>
                </div>

                <!-- 电量指示 -->
                <div class="battery-indicators">
                    <div class="indicator-item">
                        <div class="led" :class="{ active: store.batteryLevel > 20 }"></div>
                        <span>电量1</span>
                    </div>
                    <div class="indicator-item">
                        <div class="led" :class="{ active: store.batteryLevel > 50 }"></div>
                        <span>电量2</span>
                    </div>
                    <div class="indicator-item charging">
                        <div class="led" :class="{ active: store.isCharging, charging: store.isCharging }"></div>
                        <span>充电</span>
                    </div>
                </div>
            </div>

            <!-- 右侧控制区 -->
            <div class="right-section">
                <!-- 右摇杆 -->
                <Joystick label="右摇杆" x-label="CH3" y-label="CH4" v-model:model-value-x="store.ch3"
                    v-model:model-value-y="store.ch4" @press="store.rightJoystickPressed = true"
                    @release="store.rightJoystickPressed = false" />

                <!-- 右侧按键 -->
                <div class="button-group">
                    <ControlButton label="K3" v-model="store.k3Pressed" />
                    <ControlButton label="K4" v-model="store.k4Pressed" />
                </div>

                <!-- SW2 开关 -->
                <ThreeWaySwitch label="SW2" v-model="store.sw2State" />

                <!-- EXCH+ 旋钮 -->
                <RotaryKnob label="EXCH +" v-model="exchPlus" :show-reset="true" @reset="handleExchPlusReset" />

                <!-- 电源开关 -->
                <div class="power-switch">
                    <el-switch v-model="powerOn" active-text="ON" inactive-text="OFF" size="large"
                        :active-color="'#67c23a'" :inactive-color="'#909399'" @change="handlePowerChange" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Monitor, Connection, Pointer, Warning, RefreshLeft } from '@element-plus/icons-vue'
import { useRemoteControlStore } from '../stores/remoteControl'
import Joystick from '../components/Joystick.vue'
import ControlButton from '../components/ControlButton.vue'
import ThreeWaySwitch from '../components/ThreeWaySwitch.vue'
import LCDDisplay from '../components/LCDDisplay.vue'
import RotaryKnob from '../components/RotaryKnob.vue'

const store = useRemoteControlStore()
const powerOn = ref(true)
const exchMinus = ref(0)
const exchPlus = ref(0)

// 同步 EXCH 旋钮值
watch([exchMinus, exchPlus], ([minus, plus]) => {
    store.exchValue = plus - minus
})

function handleReset() {
    ElMessage.warning('执行系统复位...')
    store.resetAllChannels()
    exchMinus.value = 0
    exchPlus.value = 0
    store.sw1State = 'M'
    store.sw2State = 'M'
    ElMessage.success('系统已复位')
}

function handleToggleConnection() {
    store.toggleConnection()
    if (store.isConnected) {
        ElMessage.success('连接成功')
    } else {
        ElMessage.info('已断开连接')
    }
}

function handleExchMinusReset() {
    exchMinus.value = 0
}

function handleExchPlusReset() {
    exchPlus.value = 0
}

function handlePowerChange(val) {
    if (!val) {
        ElMessage.warning('遥控器已关闭')
        store.isConnected = false
        store.resetAllChannels()
    } else {
        ElMessage.success('遥控器已开启')
    }
}
</script>

<style scoped>
.control-panel {
    min-height: 100vh;
    padding: 24px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding: 20px 32px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.panel-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-size: 24px;
    color: #303133;
}

.status-bar {
    display: flex;
    gap: 12px;
}

.control-layout {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 40px;
    max-width: 1600px;
    margin: 0 auto;
}

.left-section,
.right-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    padding: 32px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.center-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 32px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    min-width: 400px;
}

.button-group {
    display: flex;
    gap: 16px;
}

.control-actions {
    display: flex;
    gap: 16px;
    margin-top: 16px;
}

.battery-indicators {
    display: flex;
    gap: 24px;
    padding: 16px;
    background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
    border-radius: 8px;
}

.indicator-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #606266;
}

.led {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #dcdfe6;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.3s;
}

.led.active {
    background: #67c23a;
    box-shadow:
        0 0 12px rgba(103, 194, 58, 0.6),
        inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.led.charging {
    background: #e6a23c;
    box-shadow:
        0 0 12px rgba(230, 162, 60, 0.6),
        inset 0 1px 2px rgba(255, 255, 255, 0.3);
    animation: pulse-charging 1.5s infinite;
}

@keyframes pulse-charging {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.power-switch {
    margin-top: 16px;
    padding: 16px;
    background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
    border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
    .control-layout {
        grid-template-columns: 1fr;
        gap: 24px;
    }

    .left-section,
    .right-section {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>
