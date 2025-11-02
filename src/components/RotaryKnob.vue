<template>
    <div class="knob-container">
        <div class="knob-label">{{ label }}</div>
        <div class="knob-wrapper" @mousedown="handleMouseDown" @touchstart="handleTouchStart">
            <div class="knob" :style="knobStyle">
                <div class="knob-indicator"></div>
                <div class="knob-grip" v-for="i in 8" :key="i" :style="gripStyle(i)"></div>
            </div>
        </div>
        <div class="knob-value">{{ formattedValue }}</div>
        <button v-if="showReset" class="reset-button" @click="handleReset" :disabled="modelValue === 0">
            归零
        </button>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    label: { type: String, default: '' },
    modelValue: { type: Number, default: 0 },
    min: { type: Number, default: -660 },
    max: { type: Number, default: 660 },
    step: { type: Number, default: 10 },
    showReset: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'reset'])

const isDragging = ref(false)
const startY = ref(0)
const startValue = ref(0)

const knobStyle = computed(() => {
    // 将值映射到旋转角度 (-150° 到 +150°)
    const percentage = (props.modelValue - props.min) / (props.max - props.min)
    const angle = (percentage * 300) - 150

    return {
        transform: `rotate(${angle}deg)`
    }
})

const formattedValue = computed(() => {
    const sign = props.modelValue >= 0 ? '+' : ''
    return sign + String(props.modelValue).padStart(3, '0')
})

function gripStyle(index) {
    const angle = (index - 1) * 45
    return {
        transform: `rotate(${angle}deg) translateY(-35px)`
    }
}

function handleMouseDown(e) {
    isDragging.value = true
    startY.value = e.clientY
    startValue.value = props.modelValue
    e.preventDefault()
}

function handleMouseMove(e) {
    if (!isDragging.value) return

    const delta = startY.value - e.clientY
    const sensitivity = 2
    const change = Math.round(delta / sensitivity) * props.step

    let newValue = startValue.value + change
    newValue = Math.max(props.min, Math.min(props.max, newValue))

    emit('update:modelValue', newValue)
}

function handleMouseUp() {
    isDragging.value = false
}

function handleTouchStart(e) {
    isDragging.value = true
    startY.value = e.touches[0].clientY
    startValue.value = props.modelValue
    e.preventDefault()
}

function handleTouchMove(e) {
    if (!isDragging.value) return

    const delta = startY.value - e.touches[0].clientY
    const sensitivity = 2
    const change = Math.round(delta / sensitivity) * props.step

    let newValue = startValue.value + change
    newValue = Math.max(props.min, Math.min(props.max, newValue))

    emit('update:modelValue', newValue)
}

function handleTouchEnd() {
    isDragging.value = false
}

function handleReset() {
    emit('update:modelValue', 0)
    emit('reset')
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
.knob-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.knob-label {
    font-size: 13px;
    font-weight: 600;
    color: #606266;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.knob-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
    cursor: grab;
    user-select: none;
}

.knob-wrapper:active {
    cursor: grabbing;
}

.knob {
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
    border-radius: 50%;
    box-shadow:
        0 6px 16px rgba(0, 0, 0, 0.4),
        inset 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.1s ease-out;
}

.knob-indicator {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 20px;
    background: linear-gradient(180deg, #409eff, #337ecc);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
}

.knob-grip {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 3px;
    height: 8px;
    background: rgba(100, 100, 100, 0.6);
    border-radius: 2px;
    transform-origin: center center;
}

.knob-value {
    font-size: 16px;
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #303133;
    min-width: 70px;
    text-align: center;
    padding: 4px 12px;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 4px;
}

.reset-button {
    padding: 6px 16px;
    background: linear-gradient(145deg, #f56c6c, #e54545);
    border: none;
    border-radius: 6px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3);
}

.reset-button:hover:not(:disabled) {
    background: linear-gradient(145deg, #e54545, #d43f3f);
    box-shadow: 0 4px 10px rgba(245, 108, 108, 0.4);
}

.reset-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
</style>
