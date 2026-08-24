import { api } from '../../api'
import { confirmBillableAction } from '../../platform/billing/confirmBillableAction'

export type StorageUploadResult = { notificationSent: boolean; message: string }

export interface FileStorageProvider {
  kind: FileStorageKind
  upload(id: string, file: File): Promise<StorageUploadResult>
  download(id: string, fileName: string): Promise<void>
  remove(id: string): Promise<void>
}

export type FileStorageKind = 'browser' | 'supabase'

const STORAGE_BUCKET = 'project-media' as const
const MAX_FILE_SIZE = 25 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/csv',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
])
const ALLOWED_EXTENSIONS = new Set(['pdf', 'gif', 'jpg', 'jpeg', 'png', 'webp', 'csv', 'txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip'])
const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf', gif: 'image/gif', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  csv: 'text/csv', txt: 'text/plain', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', zip: 'application/zip',
}

export const STORAGE_FILE_ACCEPT = [...ALLOWED_MIME_TYPES, ...[...ALLOWED_EXTENSIONS].map((extension) => `.${extension}`)].join(',')

export function storageFileError(file: File): string | null {
  if (file.size === 0) return `${file.name} is empty.`
  if (file.size > MAX_FILE_SIZE) return `${file.name} exceeds the 25 MB upload limit.`
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_MIME_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(extension)) {
    return `${file.name} is not a supported image, document, spreadsheet, presentation, text, or ZIP file.`
  }
  return null
}

const uploadContentType = (file: File) => MIME_BY_EXTENSION[file.name.split('.').pop()?.toLowerCase() ?? ''] ?? file.type

function assertValidFile(file: File) {
  const error = storageFileError(file)
  if (error) throw new Error(error)
}

const DB_NAME = 'vsr-workspace-files'
const STORE_NAME = 'files'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function transaction(mode: IDBTransactionMode) {
  const database = await openDatabase()
  return { database, store: database.transaction(STORE_NAME, mode).objectStore(STORE_NAME) }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const browserFileStorage: FileStorageProvider = {
  kind: 'browser',
  async upload(id, file) {
    assertValidFile(file)
    const { database, store } = await transaction('readwrite')
    await requestResult(store.put(file, id))
    database.close()
    return { notificationSent: false, message: 'Saved privately in this browser. No cloud resource was used.' }
  },
  async download(id, fileName) {
    const { database, store } = await transaction('readonly')
    const blob = await requestResult(store.get(id)) as Blob | undefined
    database.close()
    if (!blob) throw new Error('The local file is no longer available')
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  },
  async remove(id) {
    const { database, store } = await transaction('readwrite')
    await requestResult(store.delete(id))
    database.close()
  },
}

const objectPath = (id: string) => {
  if (!/^[a-z0-9_-]+$/i.test(id)) throw new Error('Invalid file identifier')
  return `operations/${id}`
}

export const supabaseFileStorage: FileStorageProvider = {
  kind: 'supabase',
  async upload(id, file) {
    assertValidFile(file)
    if (!confirmBillableAction('Cloud file upload', `${file.name} (${formatBytes(file.size)}) will be uploaded to private Supabase Storage. A completion email will use the configured email provider quota.`)) {
      throw new Error('Upload cancelled. No cloud resource was used.')
    }
    const path = objectPath(id)
    const contentType = uploadContentType(file)
    const signed = await api.storage.createSignedUpload({
      bucket: STORAGE_BUCKET,
      path,
      contentType,
      billingConfirmed: true,
    })
    await api.storage.uploadToSignedUrl(signed.signedUrl, file, contentType)
    return api.storage.uploadCompleted({ bucket: STORAGE_BUCKET, path, fileName: file.name, contentType, sizeBytes: file.size })
  },
  async download(id, fileName) {
    if (!confirmBillableAction('Cloud file download', `${fileName} will use Supabase Storage data transfer.`)) return
    const signed = await api.storage.signedDownload({ bucket: STORAGE_BUCKET, path: objectPath(id) })
    const anchor = document.createElement('a')
    anchor.href = signed.signedUrl
    anchor.download = fileName
    anchor.rel = 'noopener'
    anchor.click()
  },
  async remove(id) {
    await api.storage.remove({ bucket: STORAGE_BUCKET, path: objectPath(id) })
  },
}

function formatBytes(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

// Browser storage remains the safe default; deployments can opt into the signed Supabase provider.
export const fileStorage: FileStorageProvider =
  import.meta.env.VITE_FILE_STORAGE_PROVIDER === 'supabase' ? supabaseFileStorage : browserFileStorage

export function fileStorageFor(kind: FileStorageKind): FileStorageProvider {
  return kind === 'supabase' ? supabaseFileStorage : browserFileStorage
}
