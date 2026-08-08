import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

export const PLAN_KEY = 'general.plan'
export type Plan = 'free' | 'pro' | 'business'

export function usePlan() {
  const [plan, setPlanState] = useState<Plan>('free')

  useEffect(() => {
    api.billing.settings()
      .then((s) => {
        const v = s[PLAN_KEY]
        setPlanState(v === 'pro' || v === 'business' ? v : 'free')
      })
      .catch(() => {})
  }, [])

  const setPlan = useCallback(async (p: Plan) => {
    setPlanState(p)
    try {
      await api.billing.setSetting(PLAN_KEY, p)
    } catch {
      setPlanState('free')
    }
  }, [])

  return { plan, isPremium: plan !== 'free', setPlan }
}
