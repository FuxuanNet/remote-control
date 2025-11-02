<template>
    <div class="joystick-container">
        <div class="joystick-label">{{ label }}</div>
        <div ref="joystickArea" class="joystick-area" @mousedown="handleMouseDown" @touchstart="handleTouchStart">
            <div class="joystick-stick" :style="stickStyle" :class="{ pressed: isPressed }"
                @mousedown.stop="handleStickPress" @touchstart.stop="handleStickPress">
                <div class="joystick-center"></div>
            </div>
            <div class="joystick-crosshair">
                <div class="crosshair-h"></div>
                <div class="crosshair-v"></div>
            </div>
        </div>
        <div class="joystick-values">
            <span>{{ xLabel }}: {{ xValue }}</span>
            <span>{{ yLabel }}: {{ yValue }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    label: { type: String, default: '' },
    xLabel: { type: String, default: 'X' },
    yLabel: { type: String, default: 'Y' },
    modelValueX: { type: Number, default: 0 },
    modelValueY: { type: Number, default: 0 },
    min: { type: Number, default: -660 },
    max: { type: Number, default: 660 }
})

const emit = defineEmits(['update:modelValueX', 'update:modelValueY', 'press', 'release'])

const joystickArea = ref(null)
const xValue = ref(props.modelValueX)
const yValue = ref(props.modelValueY)
const isPressed = ref(false)
const isDragging = ref(false)

const stickStyle = computed(() => {
    const maxRadius = 50 // 最大移动半径百分比
    const xPercent = (xValue.value / props.max) * maxRadius
    const yPercent = -(yValue.value / props.max) * maxRadius

    return {
        transform: `translate(calc(-50% + ${xPercent}%), calc(-50% + ${yPercent}%))`
    }
})

function handleStickPress(e) {
    e.preventDefault()
    isPressed.value = true
    emit('press')

    setTimeout(() => {
        if (isPressed.value) {
            isPressed.value = false
            emit('release')
        }
    }, 150)
}

function handleMouseDown(e) {
    if (e.target.closest('.joystick-stick')) return
    isDragging.value = true
    updatePosition(e.clientX, e.clientY)
}

function handleMouseMove(e) {
    if (!isDragging.value) return
    updatePosition(e.clientX, e.clientY)
}

function handleMouseUp() {
    if (isDragging.value) {
        isDragging.value = false
        // 松开后回中
        xValue.value = 0
        yValue.value = 0
        emit('update:modelValueX', 0)
        emit('update:modelValueY', 0)
    }
}

function handleTouchStart(e) {
    if (e.target.closest('.joystick-stick')) return
    isDragging.value = true
    const touch = e.touches[0]
    updatePosition(touch.clientX, touch.clientY)
}

function handleTouchMove(e) {
    if (!isDragging.value) return
    const touch = e.touches[0]
    updatePosition(touch.clientX, touch.clientY)
}

function handleTouchEnd() {
    if (isDragging.value) {
        isDragging.value = false
        xValue.value = 0
        yValue.value = 0
        emit('update:modelValueX', 0)
        emit('update:modelValueY', 0)
    }
}

function updatePosition(clientX, clientY) {
    if (!joystickArea.value) return

    const rect = joystickArea.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = clientX - centerX
    const deltaY = centerY - clientY // 反转Y轴

    const maxDistance = rect.width / 2
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    let finalX = deltaX
    let finalY = deltaY

    // 限制在圆形区域内
    if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX)
        finalX = Math.cos(angle) * maxDistance
        finalY = Math.sin(angle) * maxDistance
    }

    // 映射到 [-660, 660] 范围
    xValue.value = Math.round((finalX / maxDistance) * props.max)
    yValue.value = Math.round((finalY / maxDistance) * props.max)

    emit('update:modelValueX', xValue.value)
    emit('update:modelValueY', yValue.value)
}

onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
})

onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
})
</script>

<style scoped>
.joystick-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.joystick-label {
    font-size: 14px;
    font-weight: 600;
    color: #606266;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.joystick-area {
    position: relative;
    width: 180px;
    height: 180px;
    background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
    border-radius: 50%;
    box-shadow:
        inset 0 4px 8px rgba(0, 0, 0, 0.5),
        0 2px 8px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    user-select: none;
    touch-action: none;
}

.joystick-crosshair {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.crosshair-h,
.crosshair-v {
    position: absolute;
    background: rgba(100, 100, 100, 0.3);
}

.crosshair-h {
    top: 50%;
    left: 10%;
    right: 10%;
    height: 1px;
    transform: translateY(-50%);
}

.crosshair-v {
    left: 50%;
    top: 10%;
    bottom: 10%;
    width: 1px;
    transform: translateX(-50%);
}

.joystick-stick {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    background: linear-gradient(145deg, #409eff, #337ecc);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    box-shadow:
        0 4px 12px rgba(64, 158, 255, 0.4),
        0 2px 4px rgba(0, 0, 0, 0.3);
    cursor: grab;
    transition: box-shadow 0.15s, transform 0.05s;
    z-index: 2;
}

.joystick-stick:active {
    cursor: grabbing;
}

.joystick-stick.pressed {
    box-shadow:
        0 2px 6px rgba(64, 158, 255, 0.6),
        inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.joystick-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.joystick-values {
    display: flex;
    gap: 20px;
    font-size: 13px;
    font-family: 'Courier New', monospace;
    color: #909399;
}

.joystick-values span {
    min-width: 80px;
}
</style>
