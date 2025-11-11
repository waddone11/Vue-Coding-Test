<script setup lang="ts">
import { computed } from 'vue'
import type { ToastVariant } from '@/types/files'

const props = defineProps<{
  message: string
  variant?: ToastVariant
  dismissible?: boolean
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const classes = computed(() => ['alert', `alert--${props.variant ?? 'info'}`])
</script>

<template>
  <div :class="classes">
  <p>{{ message }}</p>
  <button v-if="dismissible" type="button" @click="emit('close')" aria-label="Închide mesajul">
    ×
  </button>
  </div>
</template>

<style scoped>
.alert {
  padding: 0.9rem 1.1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-weight: 500;
}

.alert button {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: inherit;
}

.alert--success {
  background-color: #ecfdf5;
  color: #047857;
}

.alert--error {
  background-color: #fef2f2;
  color: #b91c1c;
}

.alert--info {
  background-color: #eff6ff;
  color: #1d4ed8;
}
</style>
