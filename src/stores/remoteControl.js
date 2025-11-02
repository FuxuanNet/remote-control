import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRemoteControlStore = defineStore('remoteControl', () => {
    // 连接状态
    const isConnected = ref(false)
    const currentChannel = ref(3)
    const signalStrength = ref(0)

    // 摇杆通道值 [-660, 660]
    const ch1 = ref(0) // 左摇杆 X轴
    const ch2 = ref(0) // 左摇杆 Y轴
    const ch3 = ref(0) // 右摇杆 X轴
    const ch4 = ref(0) // 右摇杆 Y轴

    // 摇杆按压状态
    const leftJoystickPressed = ref(false)
    const rightJoystickPressed = ref(false)

    // 按键状态
    const k1Pressed = ref(false)
    const k2Pressed = ref(false)
    const k3Pressed = ref(false)
    const k4Pressed = ref(false)

    // 拨杆状态 'U' | 'M' | 'D'
    const sw1State = ref('M')
    const sw2State = ref('M')

    // 旋钮额外通道 [-660, 660]
    const exchValue = ref(0)

    // 电池电量
    const batteryLevel = ref(85)
    const isCharging = ref(false)

    // 温度警告
    const temperature = ref(35)
    const isTempWarning = computed(() => temperature.value > 50)

    // 操作方法
    function updateChannel(channel, value) {
        // 限制在 [-660, 660] 范围内
        value = Math.max(-660, Math.min(660, value))

        switch (channel) {
            case 1:
                ch1.value = Math.round(value)
                break
            case 2:
                ch2.value = Math.round(value)
                break
            case 3:
                ch3.value = Math.round(value)
                break
            case 4:
                ch4.value = Math.round(value)
                break
        }
    }

    function pressButton(button, state) {
        switch (button) {
            case 1:
                k1Pressed.value = state
                break
            case 2:
                k2Pressed.value = state
                break
            case 3:
                k3Pressed.value = state
                break
            case 4:
                k4Pressed.value = state
                break
        }
    }

    function setSwitchState(sw, state) {
        if (!['U', 'M', 'D'].includes(state)) return

        if (sw === 1) {
            sw1State.value = state
        } else if (sw === 2) {
            sw2State.value = state
        }
    }

    function updateExch(value) {
        exchValue.value = Math.max(-660, Math.min(660, Math.round(value)))
    }

    function resetExch() {
        exchValue.value = 0
    }

    function resetAllChannels() {
        ch1.value = 0
        ch2.value = 0
        ch3.value = 0
        ch4.value = 0
        exchValue.value = 0
    }

    function toggleConnection() {
        isConnected.value = !isConnected.value
        if (isConnected.value) {
            signalStrength.value = Math.floor(Math.random() * 30) + 70
        } else {
            signalStrength.value = 0
        }
    }

    // 模拟对频过程
    const isPairing = ref(false)
    async function startPairing() {
        isPairing.value = true
        isConnected.value = false

        return new Promise((resolve) => {
            setTimeout(() => {
                isConnected.value = true
                isPairing.value = false
                signalStrength.value = Math.floor(Math.random() * 30) + 70
                resolve(true)
            }, 2000) // 模拟2秒对频时间
        })
    }

    return {
        // 状态
        isConnected,
        currentChannel,
        signalStrength,
        ch1,
        ch2,
        ch3,
        ch4,
        leftJoystickPressed,
        rightJoystickPressed,
        k1Pressed,
        k2Pressed,
        k3Pressed,
        k4Pressed,
        sw1State,
        sw2State,
        exchValue,
        batteryLevel,
        isCharging,
        temperature,
        isTempWarning,
        isPairing,

        // 方法
        updateChannel,
        pressButton,
        setSwitchState,
        updateExch,
        resetExch,
        resetAllChannels,
        toggleConnection,
        startPairing
    }
})
