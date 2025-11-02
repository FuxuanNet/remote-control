<template>
    <div class="switch-container">
        <div class="switch-label">{{ label }}</div>
        <div class="switch-body">
            <button v-for="option in options" :key="option.value" class="switch-button"
                :class="{ active: modelValue === option.value }" @click="handleClick(option.value)"
                :disabled="disabled">
                {{ option.label }}
            </button>
            <div class="switch-slider" :style="sliderStyle"></div>
        </div>
        <div class="switch-value">{{ currentLabel }}</div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    label: { type: String, default: '' },
    modelValue: { type: String, default: 'M' },
    disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

const options = [
    { value: 'U', label: 'UP' },
    { value: 'M', label: 'MID' },
    { value: 'D', label: 'DOWN' }
]

const currentLabel = computed(() => {
    return options.find(opt => opt.value === props.modelValue)?.label || 'MID'
})

const sliderStyle = computed(() => {
    const index = options.findIndex(opt => opt.value === props.modelValue)
    return {
        transform: `translateY(${index * 100}%)`
    }
})

function handleClick(value) {
    if (props.disabled || value === props.modelValue) return
    emit('update:modelValue', value)
    emit('change', value)
}
</script>

<style scoped>
.switch-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.switch-label {
    font-size: 13px;
    font-weight: 600;
    color: #606266;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.switch-body {
    position: relative;
    display: flex;
    flex-direction: column;
    background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
    border-radius: 8px;
    padding: 4px;
    box-shadow:
        inset 0 2px 6px rgba(0, 0, 0, 0.5),
        0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch-button {
    position: relative;
    z-index: 2;
    padding: 10px 20px;
    background: transparent;
    border: none;
    color: #909399;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s;
    user-select: none;
}

.switch-button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.switch-button.active {
    color: #fff;
}

.switch-slider {
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    height: calc(33.333% - 2.667px);
    background: linear-gradient(145deg, #409eff, #337ecc);
    border-radius: 6px;
    box-shadow:
        0 2px 8px rgba(64, 158, 255, 0.4),
        0 1px 2px rgba(0, 0, 0, 0.2);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
}

.switch-value {
    font-size: 11px;
    font-family: 'Courier New', monospace;
    color: #909399;
    min-width: 50px;
    text-align: center;
}
</style>
