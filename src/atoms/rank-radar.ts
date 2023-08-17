import { atom, atomFamily } from "recoil";
import {
  CellBorder,
  DailySummaryResponse,
  HeatmapFilter,
  HeatmapRankType,
  HeatmapRow,
  HeatMapStateData,
  Highlight,
  HighlightPanelMode,
  LeaderboardDataType,
  LeaderboardDateRange,
  LeaderboardType,
  MainTabType,
  OverviewStateData,
  STIReportStatus,
  TimelineType,
  TrackedKrt,
} from "../types/rank-radar";
import heatmapData from "@/data/heatmap.json";
import highlightData from "@/data/highlight.json";
import cellBorders from "@/data/cell-borders.json";
import dates from "@/data/dates.json";

export const krtListState = atom<TrackedKrt[]>({
  key: "krtListState",
  default: [],
});

export const krtAddProductModalState = atom({
  key: "krtAddProductModalState",
  default: false,
});

export const trackedKrtSearchValueState = atom({
  key: "trackedKrtSearchValueState",
  default: "",
});

export const selectedRowsState = atom<HeatmapRow[]>({
  key: "selectedRowsState",
  default: [],
});

export const showFilterPanelState = atom({
  key: "showFilterPanelState",
  default: false,
});

export const showHighlightPanelState = atom<HighlightPanelMode>({
  key: "showHighlightPanelState",
  default: "",
});

export const datesState = atom<string[]>({
  key: "datesState",
  default: dates,
});

export const overviewDataState = atom<OverviewStateData>({
  key: "overviewDataState",
  default: {} as OverviewStateData,
});

export const leaderboardTypeState = atom<LeaderboardType>({
  key: "leaderboardTypeState",
  default: "gainers",
});

export const leaderboardDataTypeState = atom<LeaderboardDataType>({
  key: "leaderboardDataTypeState",
  default: "organicRanks",
});

export const leaderboardDateRangeState = atom<LeaderboardDateRange>({
  key: "leaderboardDateRangeState",
  default: "1d",
});

export const leaderboardIsRootState = atom<boolean>({
  key: "leaderboardIsRootState",
  default: false,
});

export const mainTabState = atom<MainTabType>({
  key: "mainTabState",
  default: "overview",
});

export const heatmapDataState = atom<HeatMapStateData>({
  key: "heatmapDataState",
  default: {} as HeatMapStateData,
});

export const highlightsState = atom<Highlight[]>({
  key: "highlightsState",
  default: [],
});

export const heatmapIsExpandedState = atom({
  key: "heatmapIsExpandedState",
  default: false,
});

export const timelineTypeState = atom<TimelineType>({
  key: "timelineTypeState",
  default: "natural",
});

export const heatmapRankTypeState = atom<HeatmapRankType>({
  key: "heatmapRankTypeState",
  default: "organic",
});

export const selectedDateState = atom({
  key: "selectedDateState",
  default: "",
});

export const dailySummaryDataState = atom<DailySummaryResponse>({
  key: "dailySummaryDataState",
  default: {} as DailySummaryResponse,
});

export const heatmapFilterPreference = atom<{
  appliedFilters: HeatmapFilter[];
  savedFilters: HeatmapFilter[][];
}>({
  key: "heatmapFilterPreference",
  default: { appliedFilters: [], savedFilters: [] },
});

export const predefinedFiltersState = atom<HeatmapFilter[][]>({
  key: "predefinedFiltersState",
  default: [],
});

export const persistenceFilterTabState = atom({
  key: "persistenceFilterTabState",
  default: "saved",
});

export const heatmapSearchKeywordState = atom({
  key: "heatmapSearchKeywordState",
  default: "",
});

export const selectedHighlightState = atom<Highlight | null>({
  key: "selectedHighlightState",
  default: null,
});

export const krtTabState = atom({
  key: "krtTabState",
  default: "trackedKrt",
});

export const isRootModeState = atom({
  key: "isRootModeState",
  default: false,
});

export const rootExpandedState = atomFamily({
  key: "rootExpandedState",
  default: false,
});

export const cellBorderMapState = atom<Record<string, CellBorder>>({
  key: "cellBorderState",
  default: cellBorders,
});

export const stiReportStatusState = atom<STIReportStatus>({
  key: "stiReportStatusState",
  default: {
    initialized: false,
    shouldCreateReport: false,
    isAuthenticated: false,
    isLoading: false,
  },
});

export const hoveredColumnState = atom({
  key: "hoveredColumnState",
  default: "",
});

export const heatmapShowConnectPPCState = atom<{
  isShow: boolean;
  lastHideTime: number | null;
}>({
  key: "heatmapShowConnectPPCState",
  default: {
    isShow: true,
    lastHideTime: null,
  },
});
