import { Marketplace } from "./amazon-connections"
import { GridApi } from "ag-grid-community"
import {
  FilterCondition,
  FilterCriteria,
} from "./filter-options"

export interface CreateKrtPayload {
  nicheId: string
  marketplace: string
  asin: string
  isTrackingVariants: boolean
}

export interface UpdateKrtPayload {
  status: KeywordRankTrackerStatus
}

export interface AsinPreview {
  asin: string
  brand: string
  imageUrl: string
  marketplace: Marketplace
  parentAsin: string
  price: number
  rating: number
  reviewCount: number
  sellerCountry: string
  title: string
  url: string
  variations: string
}

export interface OverviewRow {
  [key: string]: number | string
}

export interface InterpolatedData {
  startValue: number
  endValue: number
  hidden?: boolean
  lastDate: string
  cellCount: number
  startDateText: string
  endDateText: string
  dates: string[]
}

export interface HeatmapRow {
  id: string
  rowId: string
  keywords?: HeatmapKeyword[]
  organicRankData: Record<string, number | null>
  impressionRankData: Record<string, number | null>
  interpolatedData: Record<string, InterpolatedData>
  isAggregateRow?: boolean
  keyword: string
  searchVolume: number
  highlights?: string[]
  svShare?: number
  relevancy?: number
  impressionRank?: number
  impressionRankShare?: number
  orgHierarchy?: string[]
  refreshedAt?: string
  exactMatches?: number
  phraseMatches?: number
  broadMatches?: number
  autoMatches?: number
  orgSales?: number
  ppcSales?: number
  currency?: string
  ppcSpend?: number
  costPerClicks?: number
  clickThroughRate?: number
  conversionRate?: number
  totalClicks?: number
  acos?: number
}

export interface Highlight {
  id: string
  krtId: string
  krtkeywordid: string
  startAt?: string
  endAt?: string
  color?: string
  title: string
  description?: string
  type: "note" | "default"
  keywords?: string[]
}

export interface HighlightDetail extends Omit<Highlight, "keywords"> {
  keywords: HeatmapKeyword[]
  searchVolume: number
  svShare: number
}

export type MainTabType = "overview" | "heatmap"

export interface OverviewStateData {
  overview: OverviewRow[]
  indicators: Indicator[]
}

export interface HeatMapStateData {
  heatmapRows: HeatmapRow[]
  aggregateRow: HeatmapRow
  keywordsHighlights?: Record<number, Highlight[]>
  indicators: Indicator[]
  roots?: RootItem[]
  hasPPCData?: boolean
}

export type ChartPeriod = "7days" | "30days" | "90days" | "1year" | "allTime"

export type TimelineType = "inverted" | "natural"

export type HeatmapRankType = "organic" | "impression" | "impressionVsOrganic"

export interface HeatmapFilter {
  criteria: FilterCriteria
  condition: FilterCondition
  value: number | string | string[]
}

export interface AddTrackedKrtForm {
  asin: string
  selectedNiche: any
  selectedMarketplace: string
  shouldTrackParentAndVariations: boolean
}

export enum KeywordRankTrackerStatus {
  INITIAL = "initial",
  NORMAL = "normal",
  FAILED = "failed",
  PAUSED = "paused",
}

export interface TrackedKrt {
  id: string
  nicheId: string
  organizationId: number
  isTrackingVariants: boolean
  status: KeywordRankTrackerStatus
  refreshedAt: string | null
  createdAt: string
  updatedAt: string | null
  __asins__: {
    id: string
    krtId: string
    asin: string
    isCompetitor: boolean
    isPrimary: boolean
  }[]
  stats: {
    krtId: string
    marketplace: string
    title: string
    imageUrl: string
    variationCount: number
    keywordCount: number
    top10SV: number
    top10KW: number
    top50SV: number
    top50KW: number
    t30dSales: number
    [key: string]: number | string | null
  }
}

export interface GetKrtParams {
  startDate: string
  order?: string
  endDate: string
  searchText?: string
  filters?: string // url encoded json
}

export interface HeatmapRank {
  krtKeywordId: string
  searchVolume: number
  organicRank: number
  sponsoredRank: number
  impressionRank: number
  bucket: string
  isInterpolated?: boolean
}

export interface AdData {
  autoMatches: number
  broadMatches: number
  clickThroughRate: number
  conversionRate: number
  costPerClicks: number
  currency: string
  exactMatches: number
  impressionRank: number
  impressionRankShare: number
  phraseMatches: number
  ppcSales: number
  ppcSpend: number
  totalClicks: number
  totalImpressions: number
  totalOrders: number
  acos: number
}

export interface HeatmapKeyword {
  keywordId: string
  isPaused: boolean
  keyword: string
  searchVolume: number
  refreshedAt: string
  svShare: number
  relevancy: number
  adData: AdData
  ranks: HeatmapRank[]
}

export interface RootItem {
  id?: string
  root: string
  broadSearchVolume: number
  broadSearchVolumeRatio: number
  frequency: number
  adData?: AdData
  keywords: HeatmapKeyword[]
  ranks: HeatmapRank[]
}

export interface Indicator {
  date: string
  blue?: number
  green?: string
  orange?: string
}

export interface AggregateResponse {
  total: {
    searchVolume: number
    searchVolumeShare: number
    keywordCount: number
  }
  average: {
    searchVolume: number
    searchVolumeShare: number
    ranks: HeatmapRank[]
    adData: AdData
  }
}

export interface OverviewResponseRow {
  avgOrganicRank: number
  bucket: string
  krtId: string
  top10kw: number
  top10sv: number
  top50kw: number
  top50sv: number
}

export interface OverviewResponse {
  indicators: Indicator[]
  overview: OverviewResponseRow[]
}

export interface HeatmapResponse {
  indicators: Indicator[]
  keywords: HeatmapKeyword[]
  aggregate: AggregateResponse
}

export interface RootsResponse {
  indicators: Indicator[]
  roots: RootItem[]
  aggregate: AggregateResponse
}

export interface CreateHighlightPayload {
  title?: string
  description?: string
  color?: string
  startAt?: string
  endAt?: string
  keywordIds?: string[]
}

export interface Badge {
  number: number
}

export interface Holiday {
  date: string
  end: string
  name: string
  rule: string
  start: string
  type: string
}

export interface DailySummaryResponse {
  badges: Badge[]
  highlights: Highlight[]
  holidays: Holiday[]
  note?: Highlight
}

export interface HeatmapGridApiType {
  gridApi?: GridApi
  setGridApi: (api: GridApi) => void
}

export interface OverviewChartData {
  top10kw: number
  top10sv: number
  avgOrganicRank: number
  date: Date
}

export interface CellBorder {
  top?: string
  left?: string
  right?: string
  bottom?: string
}

export type HighlightPanelMode = "highlight" | "summary" | ""

export interface STIReportStatus {
  initialized: boolean
  shouldCreateReport: boolean
  isAuthenticated: boolean
  isLoading: boolean
}

export type LeaderboardType = "gainers" | "losers" | "new" | "dropped"

export type LeaderboardDataType =
  | "organicRanks"
  | "impressionRanks"
  | "searchVolume"

export type LeaderboardDateRange = "1d" | "7d" | "30d"

export interface LeaderboardResponse {
  id: string
  keyword: string
  currentValue: number
  prevValue: number
  delta: number
}
