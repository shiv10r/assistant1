import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const dist = join(root, 'dist')
const html = await readFile(join(dist, 'index.html'), 'utf8')
const entryMatch = html.match(/<script[^>]+src="\/([^"?]+\.js)"/)

if (!entryMatch?.[1]) {
  throw new Error('Production entry script was not found in dist/index.html')
}

const entryPath = join(dist, entryMatch[1])
const entry = await stat(entryPath)
const chunks = (await readdir(join(dist, 'assets'))).filter((file) => file.endsWith('.js'))
const maxEntryBytes = 400_000
const minChunkCount = 10

if (entry.size > maxEntryBytes) {
  throw new Error(`Entry chunk is ${entry.size} bytes; expected at most ${maxEntryBytes}`)
}

if (chunks.length < minChunkCount) {
  throw new Error(`Build emitted ${chunks.length} JavaScript chunks; expected at least ${minChunkCount}`)
}

console.log(`Bundle check passed: ${entry.size} byte entry, ${chunks.length} JavaScript chunks`)
