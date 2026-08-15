import { useLocalCollection, genId } from '../../lib/localStore'
import type { StockMovement, StockAdjustment, MovementType } from './types'

const LEDGER_KEY = 'warehouse:ledger'
const ADJUSTMENT_KEY = 'warehouse:adjustments'

/** localStorage-backed stock ledger: every movement appended, never overwritten. */
export function useStockLedger() {
  const { items, add } = useLocalCollection<StockMovement>(LEDGER_KEY, [])

  function logMovement(m: Omit<StockMovement, 'id' | 'date'>) {
    add({ ...m, id: genId(), date: new Date().toISOString() })
  }

  return { movements: items, logMovement }
}

export function useAdjustments() {
  const { items, add } = useLocalCollection<StockAdjustment>(ADJUSTMENT_KEY, [])

  function recordAdjustment(a: Omit<StockAdjustment, 'id' | 'date'>) {
    add({ ...a, id: genId(), date: new Date().toISOString().slice(0, 10) })
  }

  return { adjustments: items, recordAdjustment }
}

export const MOVEMENT_LABEL: Record<MovementType, string> = {
  GRN: 'GRN / Receiving',
  adjustment: 'Adjustment',
  transfer_out: 'Transfer out',
  transfer_in: 'Transfer in',
  pick: 'Pick',
  return: 'Return',
  stock_count: 'Stock count',
  dispatch: 'Dispatch',
}