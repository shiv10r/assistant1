import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { railwayRequest } from '../api/railwayApi'
import type { MasterDataPage as MasterDataPageResult, MasterDataRow, MasterDataView } from './masterData.types'

const viewDetails: Record<MasterDataView, { title: string; description: string; endpoint: string }> = {
  routes: {
    title: 'Routes and timetable services',
    description: 'Authoritative corridor and service context for planned Railway operations.',
    endpoint: '/api/railway/master-data/routes',
  },
  stations: {
    title: 'Stations and operating zones',
    description: 'Organization-scoped stations available to your assigned divisions.',
    endpoint: '/api/railway/master-data/stations',
  },
  fleet: {
    title: 'Railway assets',
    description: 'Persisted asset records available to inspection and maintenance workflows.',
    endpoint: '/api/railway/master-data/assets',
  },
}

export default function MasterDataPage({ view }: { view: MasterDataView }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [result, setResult] = useState<MasterDataPageResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MasterDataRow | null>(null)
  const details = viewDetails[view]

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    railwayRequest<MasterDataPageResult>(`${details.endpoint}?page=${page}&pageSize=50`, {
      signal: controller.signal,
    }).then(({ data, error: requestError }) => {
      if (controller.signal.aborted) return
      setResult(data)
      setError(requestError?.message ?? null)
      setLoading(false)
    })
    return () => controller.abort()
  }, [details.endpoint, page])

  const items = (result?.items ?? []) as readonly MasterDataRow[]
  const rows = items.filter((item) => {
    const normalized = query.trim().toLocaleLowerCase()
    return !normalized || item.code.toLocaleLowerCase().includes(normalized) || item.name.toLocaleLowerCase().includes(normalized)
  }) ?? []

  function updateQuery(value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="railway-page">
      <section className="railway-hero railway-master-data-hero">
        <div className="railway-hero-copy">
          <span className="railway-eyebrow">Master data</span>
          <h1>{details.title}</h1>
          <p>{details.description}</p>
        </div>
      </section>

      <section className="railway-panel railway-master-data-panel" aria-busy={loading}>
        <div className="railway-panel-head railway-master-data-toolbar">
          <div>
            <span>Authorized records</span>
            <h2>{result ? `${result.total} total` : 'Loading records'}</h2>
          </div>
          <label>
            <span className="sr-only">Filter master data</span>
            <input
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Filter by code or name"
            />
          </label>
        </div>

        {loading && <p role="status">Loading authoritative Railway records...</p>}
        {!loading && error && <p role="alert">Unable to load Railway records: {error}</p>}
        {!loading && !error && rows.length === 0 && <p role="status">No matching records are available in your authorized divisions.</p>}
        {!loading && !error && rows.length > 0 && (
          <div className="railway-table-wrap">
            <div className="railway-master-table" role="table" aria-label={details.title}>
              <div className="railway-master-row head" role="row">
                <span role="columnheader">Code</span>
                <span role="columnheader">Name</span>
                <span role="columnheader">Division</span>
                <span role="columnheader">Operational detail</span>
              </div>
              {rows.map((row) => (
                <div className="railway-master-row" role="row" key={row.id}>
                  <strong role="cell">{row.code}</strong>
                  <span role="cell"><button className="railway-master-link" onClick={() => setSelected(row)}>{row.name}</button></span>
                  <code role="cell">{row.divisionId.slice(0, 8)}</code>
                  <span role="cell">{formatDetail(row)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      {selected && (
        <aside className="railway-master-drawer" role="dialog" aria-modal="true" aria-labelledby="railway-master-detail-title">
          <div>
            <span className="railway-eyebrow">{view} detail</span>
            <h2 id="railway-master-detail-title">{selected.name}</h2>
            <dl>
              <dt>Code</dt><dd>{selected.code}</dd>
              <dt>Division</dt><dd>{selected.divisionId}</dd>
              <dt>Version</dt><dd>{selected.version}</dd>
              <dt>Operational detail</dt><dd>{formatDetail(selected)}</dd>
            </dl>
            <button type="button" onClick={() => setSelected(null)}>Close details</button>
          </div>
        </aside>
      )}
    </div>
  )
}

function formatLocation(latitude: number | null, longitude: number | null) {
  return latitude === null || longitude === null ? 'Location not recorded' : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}

function formatDetail(row: MasterDataRow) {
  if ('criticality' in row) return row.criticality
  if ('corridorId' in row) return `Corridor ${row.corridorId.slice(0, 8)}`
  return formatLocation(row.latitude, row.longitude)
}
