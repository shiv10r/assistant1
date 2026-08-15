import { access, readFile, readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const src = join(root, 'src')
const sourceFiles = (await readdir(src, { recursive: true }))
  .filter((path) => path.endsWith('.ts') || path.endsWith('.tsx'))

const legacyImports = []
for (const path of sourceFiles) {
  const content = await readFile(join(src, path), 'utf8')
  if (/from\s+['"](?:\.\.\/)+ui['"]/.test(content)) legacyImports.push(path)
}

let legacyFileExists = true
try {
  await access(join(src, 'ui.tsx'))
} catch {
  legacyFileExists = false
}

if (legacyImports.length > 0 || legacyFileExists) {
  throw new Error(`Legacy UI remains: ${legacyImports.join(', ') || 'no imports'}; src/ui.tsx exists: ${legacyFileExists}`)
}

console.log('Legacy UI check passed: all consumers use canonical shared modules')
