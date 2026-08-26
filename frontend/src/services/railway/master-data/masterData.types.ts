import type {
  AssetSummary as ApiAssetSummary,
  RailwayPageOfAssetSummary,
  RailwayPageOfRouteSummary,
  RailwayPageOfStationSummary,
  RouteSummary as ApiRouteSummary,
  StationSummary as ApiStationSummary,
} from '../api/railway.generated'

type Present<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> }

export type AssetSummary = Present<ApiAssetSummary, keyof ApiAssetSummary>
export type RouteSummary = Present<ApiRouteSummary, keyof ApiRouteSummary>
export type StationSummary = Present<
  ApiStationSummary,
  Exclude<keyof ApiStationSummary, 'latitude' | 'longitude'>
> & Required<Pick<ApiStationSummary, 'latitude' | 'longitude'>>

export type MasterDataView = 'routes' | 'stations' | 'fleet'
export type MasterDataRow = AssetSummary | StationSummary | RouteSummary
export type MasterDataPage = RailwayPageOfAssetSummary | RailwayPageOfRouteSummary | RailwayPageOfStationSummary
