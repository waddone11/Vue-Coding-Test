<script setup lang="ts">
import { ref } from 'vue'
import type { UploadPayload } from '@/api/files'

const props = defineProps<{ uploading: boolean }>()
const emit = defineEmits<{ (e: 'upload', payload: UploadPayload): void }>()

const selectedFile = ref<File | null>(null)
const description = ref('')
const validationError = ref<string | null>(null)
const MAX_FILE_SIZE_MB = 5

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] ?? null
  validationError.value = null
}

function resetForm() {
  selectedFile.value = null
  description.value = ''
  validationError.value = null
}

function onSubmit() {
  if (!selectedFile.value) {
    validationError.value = 'Select a file before uploading.'
    return
  }

  if (selectedFile.value.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    validationError.value = `The file exceeds ${MAX_FILE_SIZE_MB} MB.`
    return
  }

  emit('upload', {
    file: selectedFile.value,
    description: description.value.trim() || undefined,
  })
}

</script>

<template>
  <form class="upload-card" @submit.prevent="onSubmit">
    <div>
      <label for="file" class="input-label">File</label>
      <input id="file" type="file" name="file" @change="handleFileChange" :disabled="uploading" />
      <p class="hint">Any format, maximum {{ MAX_FILE_SIZE_MB }} MB.</p>
    </div>

    <div>
      <label for="description" class="input-label">Description (optional)</label>
      <input
        id="description"
        v-model="description"
        type="text"
        name="description"
        maxlength="255"
        placeholder="e.g., Signed contract"
        :disabled="uploading"
      />
    </div>

    <p v-if="validationError" class="error">{{ validationError }}</p>

    <div class="actions">
      <button type="submit" :disabled="uploading">
        {{ uploading ? 'Uploading…' : 'Upload file' }}
      </button>
      <button type="button" class="secondary" :disabled="uploading" @click="resetForm">Reset</button>
    </div>
  </form>
</template>

<style scoped>
.upload-card {
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-label {
  font-weight: 600;
  display: block;
  margin-bottom: 0.35rem;
}

input[type='file'] {
  width: 100%;
}

input[type='text'] {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #cbd5f5;
  padding: 0.65rem 0.85rem;
  font-size: 1rem;
}

input[type='text']:focus {
  outline: 2px solid #2563eb;
  border-color: transparent;
}

.hint {
  font-size: 0.85rem;
  color: #475569;
  margin-top: 0.3rem;
}

.error {
  color: #b91c1c;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

button {
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  background: #000;
  color: #fff;
  transition: opacity 0.2s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.secondary {
  background: transparent;
  border: 1px solid #94a3b8;
  color: #0f172a;
}

button.secondary:hover:not(:disabled) {
  background: #f8fafc;
}
</style>
