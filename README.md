# Vue.js Coding Test for Artificially

## Objective

building a **File Management Frontend** that interacts with a backend API. This frontend should allow users to upload, view, download, and delete files through the provided API.

---

## What we built

- **Responsive control center** powered by a single `FileManager` component handling uploads (with validation), listing, downloads, and delete confirmations.
- **Dedicated composable (`useFiles`)** that relies on `ref`, `reactive`, `computed`, and `watch` to synchronize state, surface toasts, and keep UI updates in sync with API calls.
- **API layer** (`src/api/files.ts`) that reads both `VITE_API_BASE_URL` and `VITE_FILE_API_TOKEN`, throwing consistent `ApiError` instances reused by the UI.


## Core structure

```
src/
 ├─ api/files.ts          # request wrapper + upload/list/delete/download
 ├─ components/           # FileManager, FileUploadForm, FileList, AlertBanner
 ├─ composables/useFiles  # single source of truth for state management
 ├─ types/files.ts        # types shared with the Laravel backend
 └─ utils/format.ts       # helpers for dates/sizes
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (see `.env.example`):
   ```bash
   cp .env.example .env
   # edit VITE_API_BASE_URL if the backend runs elsewhere
   ```
   - `VITE_API_BASE_URL` must point to the Laravel API (`http://localhost:8000/api` when running locally).
   - `VITE_FILE_API_TOKEN` must match the backend middleware token (`artificially-token` in the Laravel test).
3. Run the application:
   ```bash
   npm run dev
   ```
   The UI boots at `http://localhost:5173` (or the port provided by Vite). All actions call the configured API.

## Testing

```bash
npm run test:unit
```

In this read-only environment Vitest cannot create temporary files, but on a normal local setup the command above runs the tests (`src/composables/__tests__/useFiles.spec.ts`). The suite covers listing, upload/delete flows, error handling, and auto-dismissed notifications.

## Key capabilities

- **Validated upload**: max 5 MB, optional description, instant message when the file is missing or oversized.
- **Real-time listing**: responsive table with name/description/size/date, manual refresh button, and “Last synced” timestamp.
- **Download**: triggers `downloadFile` through the API and shows an informational toast.
- **Delete**: `window.confirm` safeguard + disabled action buttons while the request is in flight.
- **Global feedback**: `AlertBanner` handles errors/toasts with auto-dismiss driven by a watcher.

## Relationship with the Laravel backend

- The token and base URL are shared between repos to avoid duplicated configuration.
- `openapi/openapi.yaml` and the Laravel Postman collection.
- The backend `FileEntrySeeder` populates data so this UI shows records right after `php artisan db:seed`.

