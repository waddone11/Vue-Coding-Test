import { computed, reactive, ref, watch } from 'vue'
import {
  ApiError,
  deleteFile as deleteFileRequest,
  downloadFile as downloadFileRequest,
  listFiles,
  uploadFile,
  type UploadPayload,
} from '@/api/files'
import type { FileRecord, ToastVariant } from '@/types/files'

const TOAST_RESET_MS = 4000

export function useFiles() {
  const rawFiles = ref<FileRecord[]>([])
  const loading = ref(false)
  const uploading = ref(false)
  const error = ref<string | null>(null)
  const lastSyncedAt = ref<Date | null>(null)
  const pendingDownloadId = ref<number | null>(null)
  const deletingIds = reactive(new Set<number>())

  const toast = reactive({
    message: null as string | null,
    type: 'info' as ToastVariant,
  })

  const files = computed(() =>
    [...rawFiles.value].sort((a, b) => {
      const left = a.created_at ? new Date(a.created_at).getTime() : 0
      const right = b.created_at ? new Date(b.created_at).getTime() : 0
      return right - left
    }),
  )

  const hasFiles = computed(() => rawFiles.value.length > 0)

  watch(
    rawFiles,
    () => {
      if (rawFiles.value.length) {
        lastSyncedAt.value = new Date()
      }
    },
    { deep: true },
  )

  watch(
    () => toast.message,
    (message, _, onCleanup) => {
      if (!message) {
        return
      }

      const timeout = window.setTimeout(() => {
        toast.message = null
      }, TOAST_RESET_MS)

      onCleanup(() => window.clearTimeout(timeout))
    },
  )

  async function fetchFiles() {
    loading.value = true
    error.value = null

    try {
      rawFiles.value = await listFiles()
    } catch (err) {
      handleError(err, 'We could not load the document list.')
    } finally {
      loading.value = false
    }
  }

  async function upload(payload: UploadPayload) {
    uploading.value = true
    error.value = null

    try {
      const created = await uploadFile(payload)
      rawFiles.value = [created, ...rawFiles.value]
      setToast('success', 'File uploaded successfully.')
    } catch (err) {
      handleError(err, 'Upload failed. Check the file format and token.')
      throw err
    } finally {
      uploading.value = false
    }
  }

  async function remove(id: number) {
    if (deletingIds.has(id)) {
      return
    }

    deletingIds.add(id)
    error.value = null

    try {
      await deleteFileRequest(id)
      rawFiles.value = rawFiles.value.filter((file) => file.id !== id)
      setToast('success', 'File deleted.')
    } catch (err) {
      handleError(err, 'Delete failed. Retry or verify the token.')
    } finally {
      deletingIds.delete(id)
    }
  }

  async function download(file: FileRecord) {
    pendingDownloadId.value = file.id

    try {
      await downloadFileRequest(file.id, file.original_name)
      setToast('info', `Download for ${file.original_name} started.`)
    } catch (err) {
      handleError(err, 'Download failed. The file may no longer exist.')
    } finally {
      pendingDownloadId.value = null
    }
  }

  function isDeleting(id: number) {
    return deletingIds.has(id)
  }

  function setToast(type: ToastVariant, message: string) {
    toast.type = type
    toast.message = message
  }

  function handleError(err: unknown, fallback: string) {
    const message = err instanceof ApiError ? err.message : fallback
    error.value = message
    setToast('error', message)
  }

  return {
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
  }
}
