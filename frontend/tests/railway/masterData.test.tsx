import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import MasterDataPage from '../../src/services/railway/master-data/MasterDataPage'

function LocationProbe() {
  return <output data-testid="location">{useLocation().search}</output>
}

describe('Railway master data', () => {
  it('renders persisted records and keeps its filter in the URL', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{
          id: 'asset-1', organizationId: 'org-1', divisionId: 'division-1', assetTypeId: 'type-1',
          code: 'SIG-101', name: 'North signal', criticality: 'High', version: 0,
        }],
      page: 1, pageSize: 50, total: 1,
      }),
      headers: new Headers(),
    }))
    render(
      <MemoryRouter initialEntries={['/railway/fleet']}>
        <MasterDataPage view="fleet" />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(await screen.findByText('SIG-101')).toBeTruthy()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Filter master data' }), 'signal')

    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('?q=signal'))
    expect(screen.queryByRole('button', { name: /create|edit|retire/i })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'North signal' }))
    expect(screen.getByRole('dialog', { name: 'North signal' })).toBeTruthy()
  })

  it('preserves primary code and name columns for narrow layouts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{
          id: 'station-1', organizationId: 'org-1', divisionId: 'division-1',
          code: 'CEN', name: 'Central', latitude: null, longitude: null, version: 0,
        }],
        page: 1, pageSize: 50, total: 1,
      }),
      headers: new Headers(),
    }))
    render(<MemoryRouter><MasterDataPage view="stations" /></MemoryRouter>)

    expect(await screen.findByText('CEN')).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Code' })).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeTruthy()
  })
})
