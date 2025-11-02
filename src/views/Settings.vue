<template>
    <div class="settings-page">
        <div class="page-header">
            <h2>
                <el-icon>
                    <Setting />
                </el-icon>
                系统设置
            </h2>
        </div>

        <div class="settings-grid">
            <!-- 系统信息卡片 -->
            <el-card>
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <InfoFilled />
                        </el-icon>
                        <span>系统信息</span>
                    </div>
                </template>

                <div class="info-list">
                    <div class="info-item">
                        <label>设备名称</label>
                        <span>DIYRC Remote Controller</span>
                    </div>
                    <div class="info-item">
                        <label>软件版本</label>
                        <span>v1.0.0</span>
                    </div>
                    <div class="info-item">
                        <label>固件版本</label>
                        <span>v2.3.1</span>
                    </div>
                    <div class="info-item">
                        <label>通信协议</label>
                        <span>串行通信</span>
                    </div>
                    <div class="info-item">
                        <label>电池电量</label>
                        <el-progress :percentage="store.batteryLevel" :color="batteryColor"
                            :status="store.batteryLevel < 20 ? 'exception' : null" />
                    </div>
                    <div class="info-item">
                        <label>设备温度</label>
                        <span :class="{ 'temp-warning': store.isTempWarning }">
                            {{ store.temperature }}°C
                            <el-icon v-if="store.isTempWarning">
                                <Warning />
                            </el-icon>
                        </span>
                    </div>
                </div>
            </el-card>

            <!-- 校准设置 -->
            <el-card>
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Tools />
                        </el-icon>
                        <span>摇杆校准</span>
                    </div>
                </template>

                <div class="calibration-section">
                    <el-alert title="摇杆校准说明" type="info" :closable="false" style="margin-bottom: 20px;">
                        校准前请确保摇杆处于中位,校准过程中请将摇杆移动到各个极限位置
                    </el-alert>

                    <div class="calibration-steps">
                        <el-steps :active="calibrationStep" align-center>
                            <el-step title="准备" description="摇杆归中" />
                            <el-step title="校准" description="移动摇杆" />
                            <el-step title="完成" description="保存设置" />
                        </el-steps>
                    </div>

                    <div class="calibration-actions">
                        <el-button type="primary" :icon="VideoPlay" :loading="isCalibrating" @click="startCalibration">
                            {{ isCalibrating ? '校准中...' : '开始校准' }}
                        </el-button>
                        <el-button :icon="RefreshLeft" @click="resetCalibration">
                            恢复默认
                        </el-button>
                    </div>
                </div>
            </el-card>

            <!-- 通道配置 -->
            <el-card>
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Operation />
                        </el-icon>
                        <span>通道配置</span>
                    </div>
                </template>

                <div class="channel-config">
                    <div class="config-item">
                        <label>通道反转</label>
                        <div class="channel-reverse">
                            <el-checkbox v-model="channelReverse.ch1">CH1</el-checkbox>
                            <el-checkbox v-model="channelReverse.ch2">CH2</el-checkbox>
                            <el-checkbox v-model="channelReverse.ch3">CH3</el-checkbox>
                            <el-checkbox v-model="channelReverse.ch4">CH4</el-checkbox>
                        </div>
                    </div>

                    <el-divider />

                    <div class="config-item">
                        <label>死区设置</label>
                        <el-slider v-model="deadzone" :min="0" :max="50" show-input
                            :marks="{ 0: '0', 25: '25', 50: '50' }" />
                        <p class="config-desc">设置摇杆中位的死区范围 (0-50)</p>
                    </div>

                    <el-divider />

                    <div class="config-item">
                        <label>灵敏度</label>
                        <el-slider v-model="sensitivity" :min="50" :max="150" show-input
                            :marks="{ 50: '低', 100: '标准', 150: '高' }" />
                        <p class="config-desc">调整摇杆响应灵敏度 (50-150%)</p>
                    </div>
                </div>
            </el-card>

            <!-- 显示设置 -->
            <el-card>
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>显示设置</span>
                    </div>
                </template>

                <div class="display-settings">
                    <div class="setting-item">
                        <label>屏幕亮度</label>
                        <el-slider v-model="brightness" :min="0" :max="100" />
                    </div>

                    <div class="setting-item">
                        <label>对比度</label>
                        <el-slider v-model="contrast" :min="0" :max="100" />
                    </div>

                    <div class="setting-item">
                        <label>背光颜色</label>
                        <el-radio-group v-model="backlightColor">
                            <el-radio label="green">绿色</el-radio>
                            <el-radio label="blue">蓝色</el-radio>
                            <el-radio label="white">白色</el-radio>
                        </el-radio-group>
                    </div>

                    <div class="setting-item">
                        <label>自动熄屏</label>
                        <el-switch v-model="autoSleep" />
                        <p class="config-desc">5分钟无操作自动关闭屏幕</p>
                    </div>
                </div>
            </el-card>

            <!-- 电源管理 -->
            <el-card>
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Pointer />
                        </el-icon>
                        <span>电源管理</span>
                    </div>
                </template>

                <div class="power-settings">
                    <div class="battery-display">
                        <el-icon class="battery-icon" :style="{ color: batteryColor }">
                            <Pointer />
                        </el-icon>
                        <div class="battery-info">
                            <h3>{{ store.batteryLevel }}%</h3>
                            <p>{{ store.isCharging ? '充电中' : '使用电池' }}</p>
                        </div>
                    </div>

                    <el-divider />

                    <div class="power-options">
                        <div class="setting-item">
                            <label>低电量提醒</label>
                            <el-slider v-model="lowBatteryThreshold" :min="10" :max="30"
                                :marks="{ 10: '10%', 20: '20%', 30: '30%' }" />
                        </div>

                        <div class="setting-item">
                            <label>省电模式</label>
                            <el-switch v-model="powerSavingMode" />
                            <p class="config-desc">降低性能以延长电池续航</p>
                        </div>
                    </div>

                    <el-alert v-if="store.isTempWarning" title="高温警告" type="warning" :closable="false">
                        充电时设备温度较高,请注意散热,避免烫伤
                    </el-alert>
                </div>
            </el-card>

            <!-- 高级设置 -->
            <el-card>
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <SetUp />
                        </el-icon>
                        <span>高级设置</span>
                    </div>
                </template>

                <div class="advanced-settings">
                    <div class="setting-item">
                        <label>调试模式</label>
                        <el-switch v-model="debugMode" />
                        <p class="config-desc">显示详细的调试信息</p>
                    </div>

                    <el-divider />

                    <div class="danger-zone">
                        <h4>
                            <el-icon>
                                <WarningFilled />
                            </el-icon>
                            危险操作
                        </h4>
                        <el-button type="danger" plain @click="handleFactoryReset">
                            恢复出厂设置
                        </el-button>
                        <p class="config-desc">将清除所有自定义设置,恢复到出厂状态</p>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- 底部操作栏 -->
        <div class="footer-actions">
            <el-button size="large" @click="cancelChanges">取消</el-button>
            <el-button type="primary" size="large" @click="saveSettings">
                保存设置
            </el-button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Setting, InfoFilled, Tools, Operation, Monitor, Pointer,
    SetUp, Warning, WarningFilled, VideoPlay, RefreshLeft
} from '@element-plus/icons-vue'
import { useRemoteControlStore } from '../stores/remoteControl'

const store = useRemoteControlStore()

// 校准相关
const calibrationStep = ref(0)
const isCalibrating = ref(false)

// 通道配置
const channelReverse = ref({
    ch1: false,
    ch2: false,
    ch3: false,
    ch4: false
})
const deadzone = ref(10)
const sensitivity = ref(100)

// 显示设置
const brightness = ref(80)
const contrast = ref(50)
const backlightColor = ref('green')
const autoSleep = ref(true)

// 电源设置
const lowBatteryThreshold = ref(20)
const powerSavingMode = ref(false)

// 高级设置
const debugMode = ref(false)

const batteryColor = computed(() => {
    if (store.batteryLevel >= 60) return '#67c23a'
    if (store.batteryLevel >= 30) return '#e6a23c'
    return '#f56c6c'
})

async function startCalibration() {
    isCalibrating.value = true
    calibrationStep.value = 0

    for (let i = 0; i <= 2; i++) {
        calibrationStep.value = i
        await new Promise(resolve => setTimeout(resolve, 1500))
    }

    isCalibrating.value = false
    ElMessage.success('校准完成!')
}

function resetCalibration() {
    calibrationStep.value = 0
    ElMessage.info('已恢复默认校准值')
}

function saveSettings() {
    ElMessage.success('设置已保存')
}

function cancelChanges() {
    ElMessage.info('已取消更改')
}

async function handleFactoryReset() {
    try {
        await ElMessageBox.confirm(
            '此操作将清除所有自定义设置,是否继续?',
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        // 重置所有设置
        store.resetAllChannels()
        channelReverse.value = { ch1: false, ch2: false, ch3: false, ch4: false }
        deadzone.value = 10
        sensitivity.value = 100
        brightness.value = 80
        contrast.value = 50
        backlightColor.value = 'green'
        autoSleep.value = true
        lowBatteryThreshold.value = 20
        powerSavingMode.value = false
        debugMode.value = false

        ElMessage.success('已恢复出厂设置')
    } catch {
        ElMessage.info('已取消操作')
    }
}
</script>

<style scoped>
.settings-page {
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

.settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    max-width: 1400px;
    margin: 0 auto 80px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #ebeef5;
}

.info-item:last-child {
    border-bottom: none;
}

.info-item label {
    font-weight: 600;
    color: #606266;
}

.info-item span {
    color: #303133;
    font-family: 'Courier New', monospace;
}

.temp-warning {
    color: #e6a23c !important;
    display: flex;
    align-items: center;
    gap: 8px;
}

.calibration-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.calibration-steps {
    padding: 20px 0;
}

.calibration-actions {
    display: flex;
    gap: 12px;
}

.channel-config,
.display-settings,
.power-settings,
.advanced-settings {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.config-item,
.setting-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.config-item label,
.setting-item label {
    font-weight: 600;
    color: #303133;
    font-size: 15px;
}

.config-desc {
    margin: 0;
    font-size: 13px;
    color: #909399;
}

.channel-reverse {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.battery-display {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px;
    background: linear-gradient(145deg, #f5f7fa, #e8ecf1);
    border-radius: 8px;
}

.battery-icon {
    font-size: 64px;
}

.battery-info h3 {
    margin: 0 0 8px 0;
    font-size: 32px;
    color: #303133;
}

.battery-info p {
    margin: 0;
    color: #606266;
}

.power-options {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.danger-zone {
    padding: 20px;
    background: #fef0f0;
    border: 1px solid #fde2e2;
    border-radius: 8px;
}

.danger-zone h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 16px 0;
    color: #f56c6c;
}

.footer-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}
</style>
