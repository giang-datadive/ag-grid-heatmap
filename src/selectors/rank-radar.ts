import { selector, selectorFamily } from "recoil";
import {
  cellBorderMapState,
  heatmapDataState,
  highlightsState,
  isRootModeState,
  mainTabState,
  overviewDataState,
  selectedRowsState,
  heatmapShowConnectPPCState,
  timelineTypeState,
} from "../atoms/rank-radar";
import { Highlight, Indicator } from "../types/rank-radar";
import { formatDate } from "../utils";
import { KrtDateFormat } from "../constants";
import { uniqBy } from "lodash";

export const keywordsHighlightsSelector = selector<Record<string, Highlight[]>>(
  {
    key: "keywordsHighlightsSelector",
    get: ({ get }) => {
      const highlights = get(highlightsState);
      const isRootMode = get(isRootModeState);
      const heatmapData = get(heatmapDataState);
      const result: Record<string, Highlight[]> = {};
      highlights.forEach((item) => {
        if (!result[item.krtkeywordid]) {
          result[item.krtkeywordid] = [];
        }
        result[item.krtkeywordid].push(item);
      });
      if (isRootMode) {
        const roots = heatmapData.heatmapRows || [];
        roots.forEach((root) => {
          const rootHighlights: Highlight[] = [];
          root.keywords?.forEach((kw) => {
            rootHighlights.push(...(result[kw.keywordId] || []));
          });

          if (rootHighlights.length) {
            result[root.id] = uniqBy(rootHighlights, "id");
          }
        });
      }

      return result;
    },
  }
);

export const heatmapRowsSelector = selector({
  key: "heatmapRowsSelector",
  get: ({ get }) => {
    const heatmapData = get(heatmapDataState);
    return heatmapData?.heatmapRows || [];
  },
});

export const heatmapAggregateRowSelector = selector({
  key: "heatmapAggregateRowSelector",
  get: ({ get }) => {
    const heatmapData = get(heatmapDataState);

    return heatmapData?.aggregateRow || null;
  },
});

export const highlightSelector = selectorFamily({
  key: "highlightSelector",
  get:
    (id: string) =>
    ({ get }) => {
      const keywordsHighlights = get(keywordsHighlightsSelector);

      return keywordsHighlights?.[id] || [];
    },
});

export const isNatualTimelineSelector = selector({
  key: "isNatualTimelineSelector",
  get: ({ get }) => {
    const timelineType = get(timelineTypeState);

    return timelineType === "natural";
  },
});

export const overviewRowsSelector = selector({
  key: "getOverviewRowsSelector",
  get: ({ get }) => {
    const overviewData = get(overviewDataState);

    return overviewData.overview || [];
  },
});

export const indicatorSelector = selector({
  key: "indicatorSelector",
  get: ({ get }) => {
    const heatmapData = get(heatmapDataState);
    const overviewData = get(overviewDataState);
    const mainTab = get(mainTabState);

    if (mainTab === "overview") {
      return overviewData?.indicators || [];
    }

    return heatmapData?.indicators || [];
  },
});

export const indicatorsMapSelector = selector({
  key: "indicatorsMapSelector",
  get: ({ get }) => {
    const indicators = get(indicatorSelector);
    const result: Record<string, Indicator> = {};
    indicators.forEach((item) => {
      const date = formatDate(new Date(item.date), KrtDateFormat, "N/A");
      result[date] = item;
    });

    return result;
  },
});

export const marketplaceTimezoneSelector = selector({
  key: "marketplaceTimezoneSelector",
  get: ({ get }) => {
    return "PST";
  },
});

export const indicatorsDateSelector = selectorFamily({
  key: "indicatorsDateSelector",
  get: ({ date }: { date: string }) => {
    return ({ get }) => {
      const indicatorsMap = get(indicatorsMapSelector);

      return indicatorsMap[date] || null;
    };
  },
});

export const rootRowsSelector = selector({
  key: "rootRowsSelector",
  get: ({ get }) => {
    const rootsData = get(heatmapDataState);

    return rootsData?.roots || [];
  },
});

export const cellBorderSelector = selectorFamily({
  key: "cellBorderSelector",
  get: (key: string) => {
    return ({ get }) => {
      const cellBorderMap = get(cellBorderMapState);

      return cellBorderMap[key] || {};
    };
  },
});

export const rootsSelector = selector({
  key: "rootsSelector",
  get: ({ get }) => {
    const heatmapData = get(heatmapDataState);

    return heatmapData?.roots || [];
  },
});

export const selectedRowMapSelector = selector<Record<string, boolean>>({
  key: "selectedRowMapSelector",
  get: ({ get }) => {
    const selectedRow = get(selectedRowsState);

    return selectedRow.reduce(
      (result, row) => ({
        ...result,
        [row.id]: true,
      }),
      {}
    );
  },
});

export const hasPPCDataSelector = selector({
  key: "isConnectedPPCSelector",
  get: ({ get }) => {
    const heatmapData = get(heatmapDataState);

    return heatmapData?.hasPPCData;
  },
});

export const showConnectPPCSelector = selector({
  key: "showConnectPPCSelector",
  get: ({ get }) => {
    const { isShow, lastHideTime } = get(heatmapShowConnectPPCState);
    const now = new Date().getTime();
    // 7 Days
    if (lastHideTime && now - lastHideTime > 7 * 24 * 60 * 60 * 1000) {
      return true;
    }

    return isShow;
  },
});
