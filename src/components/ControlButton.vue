<template>
    <button class="control-button" :class="{
        active: modelValue,
        disabled: disabled,
        [`size-${size}`]: true
    }" @mousedown="handlePress" @mouseup="handleRelease" @mouseleave="handleRelease" @touchstart="handlePress"
        @touchend="handleRelease" :disabled="disabled">
        <span class="button-label">{{ label }}</span>
        <span v-if="modelValue" class="button-indicator">●</span>
    </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    label: { type: String, required: true },
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: 'medium' } // small, medium, large
})

const emit = defineEmits(['update:modelValue', 'press', 'release'])

function handlePress(e) {
    e.preventDefault()
    if (props.disabled) return
    emit('update:modelValue', true)
    emit('press')
}

function handleRelease() {
    if (props.disabled) return
    emit('update:modelValue', false)
    emit('release')
}
</script>

<style scoped>
.control-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
    border: 2px solid #4a4a4a;
    border-radius: 8px;
    color: #e0e0e0;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    user-select: none;
    transition: all 0.15s;
    box-shadow:
        0 4px 8px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.control-button:hover:not(.disabled) {
    background: linear-gradient(145deg, #4a4a4a, #3a3a3a);
    border-color: #5a5a5a;
    box-shadow:
        0 6px 12px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.control-button.active {
    background: linear-gradient(145deg, #409eff, #337ecc);
    border-color: #66b1ff;
    color: #fff;
    box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(0, 0, 0, 0.2),
        0 0 16px rgba(64, 158, 255, 0.5);
    transform: translateY(2px);
}

.control-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.control-button.size-small {
    padding: 8px 16px;
    font-size: 12px;
}

.control-button.size-large {
    padding: 16px 32px;
    font-size: 16px;
}

.button-label {
    font-family: 'Courier New', monospace;
}

.button-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 8px;
    color: #67c23a;
    animation: pulse 1s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}
</style>
