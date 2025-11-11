import type { FileListResponse, FileRecord, FileSingleResponse } from '@/types/files'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_TOKEN = import.meta.env.VITE_FILE_API_TOKEN

if (!API_BASE_URL) {
  // Fail fast; the README instructs users to set this via .env
  throw new Error('VITE_API_BASE_URL is missing. Set it in your .env file before running the app.')
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  authorize?: boolean
  expectBinary?: boolean
}

async function request(path: string, options: RequestOptions = {}): Promise<Response> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${path}`

  const headers = new Headers(options.headers ?? {})

  if (!options.expectBinary) {
    headers.set('Accept', 'application/json')
  }

  if (options.authorize && API_TOKEN) {
    headers.set('Authorization', `Bearer ${API_TOKEN}`)
  }

  const bodyIsFormData = options.body instanceof FormData
  if (!bodyIsFormData && options.body && !headers.has('Content-Type') && !options.expectBinary) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = 'An unexpected error occurred.'
    let payload: unknown

    if (!options.expectBinary) {
      try {
        payload = await response.json()
        if (payload && typeof payload === 'object' && 'message' in payload) {
          message = String((payload as { message?: string }).message ?? message)
        }
      } catch {
        // noop - keep fallback message
      }
    }

    throw new ApiError(message, response.status, payload)
  }

  return response
}

export async function listFiles(): Promise<FileRecord[]> {
  const response = await request('/files')
  const payload = (await response.json()) as FileListResponse
  return payload.data
}

export interface UploadPayload {
  file: File
  description?: string
}

export async function uploadFile(payload: UploadPayload): Promise<FileRecord> {
  const formData = new FormData()
  formData.append('file', payload.file)
  if (payload.description) {
    formData.append('description', payload.description)
  }

  const response = await request('/files', {
    method: 'POST',
    body: formData,
    authorize: true,
  })

  const json = (await response.json()) as FileSingleResponse
  return json.data
}

export async function deleteFile(id: number): Promise<void> {
  await request(`/files/${id}`, {
    method: 'DELETE',
    authorize: true,
  })
}

export async function downloadFile(id: number, filename: string): Promise<void> {
  const response = await request(`/files/${id}`, {
    method: 'GET',
    expectBinary: true,
  })

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}
