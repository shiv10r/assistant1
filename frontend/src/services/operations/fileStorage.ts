export interface FileStorageProvider {
  upload(id: string, file: File): Promise<void>
  download(id: string, fileName: string): Promise<void>
  remove(id: string): Promise<void>
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
  async upload(id, file) {
    const { database, store } = await transaction('readwrite')
    await requestResult(store.put(file, id))
    database.close()
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

// Swap this binding for an S3, Supabase Storage, or Firebase provider without changing the files UI.
export const fileStorage: FileStorageProvider = browserFileStorage
