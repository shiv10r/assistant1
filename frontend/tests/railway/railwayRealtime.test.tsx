import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRailwayRealtime } from '../../src/services/railway/realtime/useRailwayRealtime'

const invoke = vi.fn().mockResolvedValue(undefined)
const stop = vi.fn().mockResolvedValue(undefined)
let reconnect: (() => Promise<void>) | undefined

vi.mock('@microsoft/signalr', () => ({
  LogLevel: { Warning: 1, Error: 2 },
  HubConnectionBuilder: class {
    withUrl() { return this }
    withAutomaticReconnect() { return this }
    configureLogging() { return this }
    build() {
      return {
        invoke,
        stop,
        start: vi.fn().mockResolvedValue(undefined),
        on: vi.fn(),
        onreconnecting: vi.fn(),
        onreconnected: (callback: () => Promise<void>) => { reconnect = callback },
        onclose: vi.fn(),
      }
    }
  },
}))

const stations = ['station-a']
const invalidate = vi.fn()

function Harness() {
  const status = useRailwayRealtime(stations, invalidate)
  return <output>{status}</output>
}

describe('Railway realtime', () => {
  beforeEach(() => {
    localStorage.setItem('lux_token', 'test-token')
    invoke.mockClear()
    invalidate.mockClear()
  })

  it('restores subscriptions and invalidates authoritative queries after reconnect', async () => {
    render(<Harness />)
    await screen.findByText('connected')
    expect(invoke).toHaveBeenCalledWith('SubscribeToRailwayStation', 'station-a')

    await reconnect?.()

    await waitFor(() => expect(invalidate).toHaveBeenCalledWith(null))
    expect(invoke).toHaveBeenCalledTimes(2)
  })
})
