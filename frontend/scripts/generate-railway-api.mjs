#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const args = process.argv.slice(2)
const check = args.includes('--check')
const schemaArg = readOption('--schema') ?? '../../VSRSystemsBackend/artifacts/openapi/railway.json'
const schemaPath = resolve(schemaArg)
const checkedSchemaPath = resolve('openapi/railway.json')
const generatedPath = resolve('src/services/railway/api/railway.generated.ts')

const source = JSON.parse((await readFile(schemaPath, 'utf8')).replace(/^\uFEFF/, ''))
if (!source.openapi || !source.paths || !source.info) {
  throw new Error(`Invalid OpenAPI document: ${schemaPath}`)
}

const normalized = JSON.stringify(sortObject(source), null, 2) + '\n'
const generated = generateTypes(source)

if (check) {
  const checkedSchema = await readFile(checkedSchemaPath, 'utf8').catch(() => '')
  const checkedTypes = await readFile(generatedPath, 'utf8').catch(() => '')
  if (checkedSchema !== normalized || checkedTypes !== generated) {
    throw new Error('Railway OpenAPI schema or generated TypeScript is stale. Run npm run generate:railway-api.')
  }
  console.log('Railway OpenAPI schema and generated TypeScript are current.')
} else {
  await mkdir(dirname(checkedSchemaPath), { recursive: true })
  await mkdir(dirname(generatedPath), { recursive: true })
  await writeFile(checkedSchemaPath, normalized, 'utf8')
  await writeFile(generatedPath, generated, 'utf8')
  console.log(`Generated ${generatedPath} from ${schemaPath}.`)
}

function readOption(name) {
  const inline = args.find((value) => value.startsWith(`${name}=`))
  if (inline) return inline.slice(name.length + 1)
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortObject(value[key])]))
}

function generateTypes(schema) {
  const schemas = schema.components?.schemas ?? {}
  const operations = []
  for (const [path, pathItem] of Object.entries(schema.paths)) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      const operation = pathItem[method]
      if (operation?.operationId) operations.push({ id: operation.operationId, method: method.toUpperCase(), path })
    }
  }

  const lines = [
    '// Generated from openapi/railway.json. Do not edit manually.',
    '',
  ]
  for (const [name, definition] of Object.entries(schemas)) {
    lines.push(`export type ${typeName(name)} = ${schemaType(definition)}`, '')
  }
  lines.push(
    `export type RailwayOperationId = ${operations.length ? operations.map(({ id }) => JSON.stringify(id)).join(' | ') : 'never'}`,
    '',
    'export const railwayOperations = {',
  )
  for (const operation of operations.sort((a, b) => a.id.localeCompare(b.id))) {
    lines.push(`  ${JSON.stringify(operation.id)}: { method: ${JSON.stringify(operation.method)}, path: ${JSON.stringify(operation.path)} },`)
  }
  lines.push('} as const satisfies Record<RailwayOperationId, { method: string; path: string }>', '')
  return lines.join('\n')
}

function schemaType(schema) {
  if (!schema) return 'unknown'
  if (schema.$ref) return typeName(schema.$ref.split('/').at(-1))
  if (schema.nullable) return `${schemaType({ ...schema, nullable: false })} | null`
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(' | ')
  if (schema.oneOf) return schema.oneOf.map(schemaType).join(' | ')
  if (schema.allOf) return schema.allOf.map(schemaType).join(' & ')
  if (schema.type === 'array') return `readonly (${schemaType(schema.items)})[]`
  if (schema.type === 'boolean') return 'boolean'
  if (schema.type === 'integer' || schema.type === 'number') return 'number'
  if (schema.type === 'string') return 'string'
  if (schema.type === 'object' || schema.properties) {
    const required = new Set(schema.required ?? [])
    const properties = Object.entries(schema.properties ?? {}).map(([name, property]) =>
      `${JSON.stringify(name)}${required.has(name) ? '' : '?'}: ${schemaType(property)}`)
    return `{ ${properties.join('; ')} }`
  }
  return 'unknown'
}

function typeName(name) {
  const safe = String(name).split('.').at(-1).replace(/[^A-Za-z0-9_$]/g, '_')
  return /^[A-Za-z_$]/.test(safe) ? safe : `Schema_${safe}`
}
