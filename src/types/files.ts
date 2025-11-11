export interface FileRecord {
  id: number
  original_name: string
  description: string | null
  mime_type: string | null
  size: number
  disk: string
  path: string
  download_url: string
  created_at: string | null
}

export interface FileListResponse {
  data: FileRecord[]
}

export interface FileSingleResponse {
  data: FileRecord
}

export type ToastVariant = 'success' | 'error' | 'info'
