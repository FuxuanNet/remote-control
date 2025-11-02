<template>
    <div class="lcd-display">
        <div class="lcd-screen">
            <!-- 第一行：DIYRC 标题 -->
            <div class="lcd-row title-row">
                <span class="lcd-text title">DIYRC</span>
            </div>

            <!-- 第二行：Ch1, 摇杆按压, Ch3 -->
            <div class="lcd-row">
                <span class="lcd-text">Ch1 {{ formatValue(ch1) }}</span>
                <span class="lcd-text joystick-press">
                    <span :class="{ active: leftPressed }">{{ leftPressed ? 'o' : ' ' }}</span>
                    <span :class="{ active: rightPressed }">{{ rightPressed ? 'o' : ' ' }}</span>
                </span>
                <span class="lcd-text">Ch3 {{ formatValue(ch3) }}</span>
            </div>

            <!-- 第三行:Ch2, Ch4 -->
            <div class="lcd-row">
                <span class="lcd-text">Ch2 {{ formatValue(ch2) }}</span>
                <span class="lcd-text spacer"></span>
                <span class="lcd-text">Ch4 {{ formatValue(ch4) }}</span>
            </div>

            <!-- 第四行: K1-K4 按键状态 -->
            <div class="lcd-row">
                <span class="lcd-text">
                    K1{{ k1 ? 'o' : ' ' }} K2{{ k2 ? 'o' : ' ' }}
                    K3{{ k3 ? 'o' : ' ' }} K4{{ k4 ? 'o' : ' ' }}
                </span>
            </div>

            <!-- 第五行: SW1, SW2 拨杆状态 -->
            <div class="lcd-row">
                <span class="lcd-text">SW1 {{ sw1 }}</span>
                <span class="lcd-text spacer"></span>
                <span class="lcd-text">SW2 {{ sw2 }}</span>
            </div>

            <!-- 第六行: EXCH 旋钮 -->
            <div class="lcd-row">
                <span class="lcd-text">EXCH {{ formatValue(exch) }}</span>
            </div>

            <!-- 第七行: 连接状态和通道 -->
            <div class="lcd-row">
                <span class="lcd-text">
                    <span :class="{ 'status-connected': connected, 'status-disconnected': !connected }">
                        {{ connected ? 'C' : 'X' }}
                    </span>
                    {{ String(channel).padStart(3, '0') }}
                </span>
            </div>
        </div>

        <!-- LCD 边框装饰 -->
        <div class="lcd-bezel"></div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    ch1: { type: Number, default: 0 },
    ch2: { type: Number, default: 0 },
    ch3: { type: Number, default: 0 },
    ch4: { type: Number, default: 0 },
    leftPressed: { type: Boolean, default: false },
    rightPressed: { type: Boolean, default: false },
    k1: { type: Boolean, default: false },
    k2: { type: Boolean, default: false },
    k3: { type: Boolean, default: false },
    k4: { type: Boolean, default: false },
    sw1: { type: String, default: 'M' },
    sw2: { type: String, default: 'M' },
    exch: { type: Number, default: 0 },
    connected: { type: Boolean, default: false },
    channel: { type: Number, default: 3 }
})

function formatValue(val) {
    const sign = val >= 0 ? '+' : ''
    return sign + String(val).padStart(3, '0')
}
</script>

<style scoped>
.lcd-display {
    position: relative;
    padding: 16px;
    background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
    border-radius: 12px;
    box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.lcd-screen {
    position: relative;
    padding: 16px 20px;
    background: linear-gradient(180deg, #9db89d, #a8c4a8);
    border-radius: 6px;
    font-family: 'Courier New', 'LCD', monospace;
    font-size: 16px;
    line-height: 1.6;
    color: #1a3d1a;
    box-shadow:
        inset 0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 0 0 2px rgba(0, 0, 0, 0.1);
    min-width: 320px;
}

.lcd-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 4px 0;
    font-weight: 600;
    letter-spacing: 1px;
}

.lcd-row.title-row {
    justify-content: center;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(26, 61, 26, 0.2);
    margin-bottom: 8px;
}

.lcd-text {
    white-space: pre;
}

.lcd-text.title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 3px;
}

.lcd-text.spacer {
    flex: 0.3;
}

.joystick-press {
    display: flex;
    gap: 12px;
    font-size: 18px;
}

.joystick-press span {
    transition: color 0.15s;
}

.joystick-press span.active {
    color: #0f5a0f;
    font-weight: 900;
}

.status-connected {
    color: #0f5a0f;
    font-weight: 900;
    animation: blink 2s infinite;
}

.status-disconnected {
    color: #5a0f0f;
    font-weight: 900;
}

@keyframes blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.6;
    }
}

.lcd-bezel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    pointer-events: none;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        inset 0 -1px 0 rgba(0, 0, 0, 0.5);
}

/* 屏幕扫描线效果 */
.lcd-screen::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(0deg,
            rgba(0, 0, 0, 0.03) 0px,
            rgba(0, 0, 0, 0.03) 1px,
            transparent 1px,
            transparent 2px);
    pointer-events: none;
    border-radius: 6px;
}
</style>
