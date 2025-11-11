import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useFiles } from '../useFiles'
import type { FileRecord } from '@/types/files'

const apiMocks = vi.hoisted(() => {
  const listFilesMock = vi.fn()
  const uploadFileMock = vi.fn()
  const deleteFileMock = vi.fn()
  const downloadFileMock = vi.fn()

  class MockApiError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'ApiError'
    }
  }

  return { listFilesMock, uploadFileMock, deleteFileMock, downloadFileMock, MockApiError }
})

const sampleFile = (overrides: Partial<FileRecord> = {}): FileRecord => ({
  id: overrides.id ?? 1,
  original_name: overrides.original_name ?? 'contract.pdf',
  description: overrides.description ?? 'Signed contract',
  mime_type: overrides.mime_type ?? 'application/pdf',
  size: overrides.size ?? 1024,
  disk: overrides.disk ?? 'local',
  path: overrides.path ?? 'files/contract.pdf',
  download_url: overrides.download_url ?? 'http://localhost/files/1',
  created_at: overrides.created_at ?? '2024-01-01T10:00:00Z',
})

vi.mock('@/api/files', () => ({
  listFiles: apiMocks.listFilesMock,
  uploadFile: apiMocks.uploadFileMock,
  deleteFile: apiMocks.deleteFileMock,
  downloadFile: apiMocks.downloadFileMock,
  ApiError: apiMocks.MockApiError,
}))

beforeEach(() => {
  apiMocks.listFilesMock.mockReset()
  apiMocks.uploadFileMock.mockReset()
  apiMocks.deleteFileMock.mockReset()
  apiMocks.downloadFileMock.mockReset()
})

describe('useFiles', () => {
  it('fetches and sorts files', async () => {
    apiMocks.listFilesMock.mockResolvedValueOnce([
      sampleFile({ id: 2, created_at: '2024-01-02T10:00:00Z' }),
      sampleFile({ id: 1, created_at: '2024-01-01T10:00:00Z' }),
    ])

    const manager = useFiles()
    await manager.fetchFiles()

    expect(manager.files.value[0].id).toBe(2)
    expect(manager.hasFiles.value).toBe(true)
    expect(manager.loading.value).toBe(false)
  })

  it('appends uploaded file to the list and resets uploading state', async () => {
    apiMocks.uploadFileMock.mockResolvedValueOnce(sampleFile({ id: 3 }))

    const manager = useFiles()
    await manager.upload({ file: new File(['dummy'], 'dummy.txt') })

    expect(manager.files.value[0].id).toBe(3)
    expect(manager.uploading.value).toBe(false)
  })

  it('removes a file on delete', async () => {
    const manager = useFiles()
    manager.files.value = [sampleFile({ id: 4 })]

    await manager.remove(4)

    expect(apiMocks.deleteFileMock).toHaveBeenCalledWith(4)
    expect(manager.files.value).toHaveLength(0)
  })

  it('handles API errors by exposing toast + error message', async () => {
    const manager = useFiles()
    apiMocks.listFilesMock.mockRejectedValueOnce(new apiMocks.MockApiError('Nope'))
    await manager.fetchFiles()

    expect(manager.error.value).toBe('Nope')
    expect(manager.toast.message).toBe('Nope')
  })

  it('auto-dismisses toast after timeout', async () => {
    vi.useFakeTimers()
    const manager = useFiles()
    manager.toast.message = 'temporary'

    await nextTick()
    vi.advanceTimersByTime(4000)

    expect(manager.toast.message).toBeNull()
    vi.useRealTimers()
  })
})
