<script setup lang="ts">
import type { FileRecord } from '@/types/files'
import { formatBytes, formatDateTime } from '@/utils/format'

const props = defineProps<{
  files: FileRecord[]
  loading: boolean
  hasFiles: boolean
  pendingDownloadId: number | null
  isDeleting: (id: number) => boolean
  lastSyncedAt: Date | null
}>()

const emit = defineEmits<{
  (e: 'download', file: FileRecord): void
  (e: 'delete', file: FileRecord): void
  (e: 'refresh'): void
}>()
</script>

<template>
  <section class="list-card">
    <header>
      <div>
        <h2>Uploaded files</h2>
        <p v-if="props.lastSyncedAt" class="muted">
          Last synced: {{ formatDateTime(props.lastSyncedAt ? props.lastSyncedAt.toISOString() : null) }}
        </p>
      </div>
      <button type="button" class="ghost" @click="emit('refresh')" :disabled="loading">
        Refresh
      </button>
    </header>

    <div v-if="loading" class="empty-state" aria-live="polite">Loading data…</div>

    <div v-else-if="!hasFiles" class="empty-state">
      <p>No documents yet. Upload a file to populate the list.</p>
    </div>

    <div v-else class="table-wrapper" role="table">
      <div class="table-row table-header" role="row">
        <span>File</span>
        <span>Size</span>
        <span>Uploaded at</span>
        <span>Actions</span>
      </div>
      <div v-for="file in files" :key="file.id" class="table-row" role="row">
        <div>
          <p class="file-name">{{ file.original_name }}</p>
          <p class="muted">{{ file.description || 'No description' }}</p>
        </div>
        <span>{{ formatBytes(file.size) }}</span>
        <span>{{ formatDateTime(file.created_at) }}</span>
        <div class="actions">
          <button
            type="button"
            class="ghost"
            :disabled="pendingDownloadId === file.id"
            @click="emit('download', file)"
          >
            {{ pendingDownloadId === file.id ? 'Preparing…' : 'Download' }}
          </button>
          <button
            type="button"
            class="danger"
            :disabled="props.isDeleting(file.id)"
            @click="emit('delete', file)"
          >
            {{ props.isDeleting(file.id) ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.list-card {
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

h2 {
  margin-bottom: 0.25rem;
}

.muted {
  color: #64748b;
  font-size: 0.9rem;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.table-row {
  display: grid;
  grid-template-columns: 2.5fr 0.8fr 1.1fr 1fr;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.table-header {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  border-bottom: 2px solid #cbd5f5;
}

.file-name {
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  border: 2px dashed #cbd5f5;
  border-radius: 1rem;
  color: #475569;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

button.ghost,
button.danger {
  border-radius: 999px;
  padding: 0.5rem 1.2rem;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
}

button.ghost {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

button.danger {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .table-row,
  .table-header {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
