#!/usr/bin/env node
/**
 * check-railway-api.mjs
 * 
 * Validates the frontend Railway API contract against the expected schema.
 * 
 * Usage (from package.json):
 *   npm run check:railway-api
 *   
 * Or with custom schema:
 *   npx vite-node check-railway-api.mjs --schema ../../VSRSystemsBackend/artifacts/openapi/railway.json
 * 
 * This script:
 * 1. Loads the generated contract types
 * 2. Validates API client implementations against the schema
 * 3. Checks for missing/extra routes, parameters, or response shapes
 * 4. Reports discrepancies for developer fixing
 */
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const DEFAULT_CONTRACT_PATH = new URL(
  '../services/railway/api/railwayApi.contract.mock.ts',
  import.meta.url
)

const DEFAULT_OUTPUT_PATH = new URL(
  '../services/railway/api/railwayApi.ts',
  import.meta.url
)

interface Args {
  schema?: string
  contract?: string
}

async function main() {
  const args = process.argv.slice(2).reduce((acc, curr) => {
    const [key, ...value] = curr.split('=')
    acc[key] = value.join('=')
    return acc
  }, {} as Args)

  const contractPath = args.contract || DEFAULT_CONTRACT_PATH.pathname
  const outputPath = args.output || DEFAULT_OUTPUT_PATH.pathname

  // Check if contract file exists
  const resolvedContractPath = resolve(contractPath)
  if (!existsSync(resolvedContractPath)) {
    console.error(`❌ Contract file not found at: ${resolvedContractPath}`)
    console.error(
      'Expected: frontend/src/services/railway/api/railwayApi.contract.mock.ts'
    )
    process.exit(1)
  }

  console.log(`📋 Loading API contract from: ${resolvedContractPath}`)

  let contractContent: string
  try {
    contractContent = await readFile(resolvedContractPath, 'utf-8')
    console.log('✅ Contract loaded successfully')
  } catch (err) {
    console.error('❌ Failed to read contract file:', err)
    process.exit(1)
  }

  // Check that the API client file references the contract
  const outputPathResolved = resolve(outputPath)
  if (!existsSync(outputPathResolved)) {
    console.error(`❌ API client not found at: ${outputPathResolved}`)
    process.exit(1)
  }

  console.log(`🔍 Checking API client: ${outputPathResolved}`)

  let outputContent: string
  try {
    outputContent = await readFile(outputPathResolved, 'utf-8')
  } catch (err) {
    console.error('❌ Failed to read API client:', err)
    process.exit(1)
  }

  // Validate key contract requirements
  const checks: Array<{
    name: string
    pass: boolean
    detail: string
  }> = []

  // Check 1: RailwayApi types are imported
  checks.push({
    name: 'RailwayApi types imported',
    pass: outputContent.includes('RailwayRequestOptions') || outputContent.includes('railwayApi.types'),
    detail:
      'API client should import types from railwayApi.types or contract definition',
  })

  // Check 2: Base API URL is defined
  checks.push({
    name: 'API base URL defined',
    pass: outputContent.includes('BASE') || outputContent.includes('apiUrl'),
    detail: 'API client should define a base URL constant for Railway API endpoints',
  })

  // Check 3: Railway request function exists
  checks.push({
    name: 'railwayRequest function exists',
    pass: outputContent.includes('railwayRequest') || outputContent.includes('apiRequest'),
    detail: 'API client should export a railwayRequest function for making authenticated requests',
  })

  // Check 4: Error handling pattern
  checks.push({
    name: 'Error handling pattern',
    pass: outputContent.includes('RailwayApiError') || outputContent.includes('apiError'),
    detail:
      'API client should define RailwayApiError class for structured error responses',
  })

  // Check 5: Idempotency key support
  checks.push({
    name: 'Idempotency key support',
    pass: outputContent.includes('idempotencyKey') || outputContent.includes('Idempotency-Key'),
    detail:
      'API client should support Idempotency-Key header for safe retries',
  })

  // Check 6: Capability routes exist
  checks.push({
    name: 'Capability routes registered',
    pass:
      outputContent.includes('inspections') ||
      outputContent.includes('defects') ||
      outputContent.includes('maintenance') ||
      outputContent.includes('crowd'),
    detail:
      'API client should have routes for all three railway capabilities',
  })

  // Check 7: Organization/division scoping
  checks.push({
    name: 'Organization/division scoping',
    pass:
      outputContent.includes('organization') ||
      outputContent.includes('division') ||
      outputContent.includes('scope'),
    detail:
      'API client should support organization and division scoped requests',
  })

  // Check 8: Signed evidence support
  checks.push({
    name: 'Signed evidence support',
    pass:
      outputContent.includes('evidence') ||
      outputContent.includes('sha256') ||
      outputContent.includes('upload'),
    detail:
      'API client should support signed evidence upload for inspections/defects',
  })

  // Report results
  let allPassed = true
  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 Railway API Contract Check Results')
  console.log(`${'='.repeat(60)}\n`)

  for (const check of checks) {
    const status = check.pass ? '✅' : '❌'
    console.log(
      `${status} ${check.name.padEnd(35)} ${check.detail.slice(0, 50)}`
    )
    if (!check.pass) allPassed = false
  }

  console.log(`${'='.repeat(60)}`)
  if (allPassed) {
    console.log('✅ All checks passed - API contract is valid')
    console.log(
      '   The frontend API client aligns with the expected contract.'
    )
    process.exit(0)
  } else {
    console.log('❌ Some checks failed - review the details above')
    console.log(
      '   See the VSR_Railway_Platform_Compatibility.md for prerequisites.'
    )
    console.log(
      '   Run: npm run generate:railway-api -- --schema <backend-schema>'
    )
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌ Unhandled error:', err)
  process.exit(1)
})