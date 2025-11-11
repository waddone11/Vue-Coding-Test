<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FileList from './FileList.vue'
import FileUploadForm from './FileUploadForm.vue'
import AlertBanner from './AlertBanner.vue'
import { useFiles } from '@/composables/useFiles'
import type { UploadPayload } from '@/api/files'
import type { FileRecord } from '@/types/files'

const fileManager = useFiles()
const {
  files,
  hasFiles,
  loading,
  uploading,
  error,
  toast,
  lastSyncedAt,
  pendingDownloadId,
  fetchFiles,
  upload,
  remove,
  download,
  isDeleting,
} = fileManager
const uploadFormKey = ref(0)

onMounted(() => {
  fetchFiles()
})

async function handleUpload(payload: UploadPayload) {
  try {
    await upload(payload)
    uploadFormKey.value += 1
  } catch {
    // feedback is deja livrat prin toast
  }
}

async function handleDelete(file: FileRecord) {
  const confirmed = window.confirm(`Delete "${file.original_name}"? This action is irreversible.`)
  if (!confirmed) {
    return
  }

  await remove(file.id)
}
</script>

<template>
  <section class="manager-grid">
    <div>
      <FileUploadForm :key="uploadFormKey" :uploading="uploading" @upload="handleUpload" />

      <AlertBanner
        v-if="toast.message"
        class="mt-3"
        :variant="toast.type"
        :message="toast.message ?? ''"
        dismissible
        @close="toast.message = null"
      />

      <AlertBanner v-else-if="error" class="mt-3" variant="error" :message="error ?? ''" />
    </div>

    <FileList
      :files="files"
      :loading="loading"
      :has-files="hasFiles"
      :pending-download-id="pendingDownloadId"
      :is-deleting="isDeleting"
      :last-synced-at="lastSyncedAt"
      @download="download"
      @delete="handleDelete"
      @refresh="fetchFiles()"
    />
  </section>
</template>

<style scoped>
.manager-grid {
  display: grid;
  grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
  gap: 1.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

@media (max-width: 900px) {
  .manager-grid {
    grid-template-columns: 1fr;
  }
}
</style>
