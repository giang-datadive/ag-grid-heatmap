import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  datesState,
  heatmapIsExpandedState,
  heatmapRankTypeState,
  krtListState,
  selectedDateState,
  showFilterPanelState,
  showHighlightPanelState,
} from "./atoms/rank-radar";
import { useRouter } from "next/router";
import { HighlightPanelMode } from "./types/rank-radar";
import { useCallback, useMemo } from "react";
import {
  isNatualTimelineSelector,
  keywordsHighlightsSelector,
  marketplaceTimezoneSelector,
  showConnectPPCSelector,
} from "./selectors/rank-radar";
import RootKeywordRenderer from "./cell-renderers/RootKeywordRenderer";
import AgHeaderRenderer from "./components/ag-grid/AgHeaderRenderer";
import KeywordHeaderRenderer from "./cell-renderers/KeywordHeaderRenderer";
import SearchVolumeRenderer from "./cell-renderers/SearchVolumeRenderer";
import SearchVolumeHeaderRenderer from "./cell-renderers/SearchVolumeHeaderRenderer";
import {
  currencyCellFormatter,
  numberCellFormatter,
  percentageCellFormatter,
} from "./components/ag-grid/helpers";
import {
  CellClassParams,
  CheckboxSelectionCallbackParams,
  ColDef,
  RowNode,
  ValueFormatterParams,
} from "ag-grid-community";
import PPCRankRenderer from "./cell-renderers/PPCRankRenderer";
import CVRHeaderRenderer from "./cell-renderers/CVRHeaderRenderer";
import RankRenderer from "./cell-renderers/RankRenderer";
import RankHeaderRenderer from "./cell-renderers/RankHeaderRenderer";
import KeywordHighlightRenderer from "./cell-renderers/KeywordHighlightRenderer";
import { formatDate, formatPercentage } from "./utils";
import { formatInTimeZone } from "date-fns-tz";
import classNames from "classnames";
import NoPPCDataHeaderRenderer from "./cell-renderers/NoPPCDataHeaderRenderer";
import RelevancyHeaderRenderer from "./cell-renderers/RelevancyHeaderRenderer";
import ValueRenderer from "./cell-renderers/ValueRenderer";
import { getDateFromString } from "./utils";
import { endOfMonth } from "date-fns";

export const useIsShowDualRank = () => {
  const rankType = useRecoilValue(heatmapRankTypeState);

  return rankType === "impressionVsOrganic";
};

export const useKrtId = () => {
  const router = useRouter();

  return router.query.krtId as string;
};

export const useDateRange = () => {
  const dates = useRecoilValue(datesState);

  return {
    startDate: dates[0],
    endDate: dates[dates.length - 1],
  };
};

export const useSelectedKrt = () => {
  const krtId = useKrtId();
  const trackedKrts = useRecoilValue(krtListState);

  return trackedKrts.find((product) => product.id === krtId);
};

export const useKrtSelectedNicheId = (): string => {
  const selectedKrt = useSelectedKrt();

  return selectedKrt?.nicheId || "";
};

export const useMarketPlaceTimeZone = () =>
  useRecoilValue(marketplaceTimezoneSelector);

export const useMarketPlaceLocale = () => {
  return "com";
};

export const useDateColumns = () => {
  const selectedKrt = useSelectedKrt();
  const isNaturalTimeline = useRecoilValue(isNatualTimelineSelector);
  const dates = useRecoilValue(datesState);
  const timeZone = useMarketPlaceTimeZone();
  if (!selectedKrt) return dates;
  const createdAtText = formatDate(
    new Date(selectedKrt.createdAt),
    "yyyy-MM-dd",
    "N/A",
    timeZone
  );
  const validDates = dates.filter((date) => date >= createdAtText);

  if (isNaturalTimeline) {
    return validDates;
  }

  return validDates.concat().reverse();
};

export const useColumnDefs = (isRootMode: boolean) => {
  const isExpanded = useRecoilValue(heatmapIsExpandedState);
  const dateColumns = useDateColumns();
  const keywordHighlights = useRecoilValue(keywordsHighlightsSelector);
  const timeZone = useMarketPlaceTimeZone();
  const isShowDualRank = useIsShowDualRank();
  const showConnectPpc = useRecoilValue(showConnectPPCSelector);
  const isNaturalTimeline = useRecoilValue(isNatualTimelineSelector);

  return useMemo(() => {
    return [
      ...(isRootMode
        ? []
        : [
            {
              colId: "select",
              initialWidth: 40,
              headerCheckboxSelection: true,
              checkboxSelection: ({ data }: CheckboxSelectionCallbackParams) =>
                !data.isAggregateRow,
              pinned: true,
              suppressColumnsToolPanel: true,
            },
            {
              colId: "keywordHighlights",
              initialWidth: 50,
              cellRenderer: KeywordHighlightRenderer,
              headerName: "",
              headerClass: "!pl-0",
              pinned: true,
              suppressColumnsToolPanel: true,
              sortable: true,
              sortingOrder: [null, "desc", "asc"],
              comparator: (
                _: string,
                __: string,
                nodeA: RowNode,
                nodeB: RowNode
              ) => {
                const numberOfHighlightA =
                  keywordHighlights[nodeA.data.id]?.length || 0;
                const numberOfHighlightB =
                  keywordHighlights[nodeB.data.id]?.length || 0;

                return numberOfHighlightA - numberOfHighlightB;
              },
            },
          ]),
      {
        initialWidth: 220,
        minWidth: 220,
        headerName: "KW",
        field: "keyword",
        cellRenderer: RootKeywordRenderer,
        headerComponent: AgHeaderRenderer,
        headerComponentParams: {
          content: <KeywordHeaderRenderer />,
        },
        cellClass: ({ data }: CellClassParams) =>
          data.isAggregateRow
            ? "!left-5 !pl-1 !w-[325px]"
            : "hidden-child-parent",
        headerClass: "ag-header-left-text",
        pinned: true,
      },
      {
        initialWidth: 90,
        headerName: "SV",
        field: "searchVolume",
        cellRenderer: SearchVolumeRenderer,
        headerComponent: AgHeaderRenderer,
        headerComponentParams: {
          content: <SearchVolumeHeaderRenderer />,
          reversed: true,
          className: "search-volume-header",
        },
        valueFormatter: numberCellFormatter,
        headerClass: "ag-header-right-text justify-end !pr-3",
        cellClass: "text-right justify-end !overflow-visible !pr-3",
        sort: "desc",
        pinned: true,
        resizable: false,
      },
      {
        width: 160,
        headerName: "Refreshed at",
        headerClass: "ag-header-left-text header-top-blue-border",
        field: "refreshedAt",
        valueFormatter: ({ value }: ValueFormatterParams) =>
          value ? formatInTimeZone(value, timeZone, "yyyy-MM-dd") : "",
        hide: !isExpanded,
        pinned: showConnectPpc,
        cellRenderer: ValueRenderer,
        resizable: false,
      },
      {
        initialWidth: 90,
        headerName: "SV Share",
        field: "svShare",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        cellRenderer: ValueRenderer,
        valueFormatter: ({ value }: ValueFormatterParams) =>
          formatPercentage(value, "0,0.0"),
        hide: !isExpanded,
        pinned: showConnectPpc,
        resizable: false,
      },
      {
        initialWidth: 80,
        headerName: "Rel.",
        headerComponent: AgHeaderRenderer,
        headerComponentParams: {
          content: <RelevancyHeaderRenderer />,
        },
        cellRenderer: ValueRenderer,
        field: "relevancy",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        valueFormatter: ({ value }: ValueFormatterParams) =>
          formatPercentage(value, "0,0"),
        hide: !isExpanded,
        pinned: showConnectPpc,
        resizable: false,
      },
      {
        initialWidth: 400,
        headerName: "",
        field: "",
        headerClass: "ag-header-right-text header-top-blue-border !px-0",
        headerComponent: NoPPCDataHeaderRenderer,
        hide: !isExpanded || !showConnectPpc,
        cellRenderer: ValueRenderer,
        pinned: true,
        resizable: false,
      },
      {
        initialWidth: 80,
        headerName: "Impr. Rank",
        field: "impressionRank",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        cellRenderer: ValueRenderer,
        valueFormatter: (value: ValueFormatterParams) =>
          numberCellFormatter(value, "", "0,0"),
        hide: !isExpanded,
        resizable: false,
      },
      {
        initialWidth: 80,
        headerName: "Impr. Share",
        field: "impressionRankShare",
        cellRenderer: ValueRenderer,
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        valueFormatter: (value: ValueFormatterParams) =>
          percentageCellFormatter(value, {
            formatType: "0,0.0",
          }),
        hide: !isExpanded,
        resizable: false,
      },
      {
        width: 30,
        headerName: "Ex",
        headerTooltip: "# of Exact Campaigns",
        sortable: false,
        field: "exactMatches",
        headerClass: "!px-0 header-top-blue-border",
        cellClass: "text-right justify-center",
        cellRenderer: PPCRankRenderer,
        hide: !isExpanded,
        resizable: false,
      },
      {
        width: 30,
        headerName: "Ph",
        headerTooltip: "# of Phrase Campaigns",
        sortable: false,
        field: "phraseMatches",
        headerClass: "!px-0 header-top-blue-border",
        cellClass: "justify-center",
        cellRenderer: PPCRankRenderer,
        hide: !isExpanded,
        resizable: false,
      },
      {
        width: 30,
        headerName: "Br",
        headerTooltip: "# of Broad Campaigns",
        sortable: false,
        field: "broadMatches",
        headerClass: "!px-0 header-top-blue-border",
        cellClass: "justify-center",
        cellRenderer: PPCRankRenderer,
        hide: !isExpanded,
        resizable: false,
      },
      {
        width: 30,
        headerName: "Au",
        headerTooltip: "# of Auto Campaigns",
        sortable: false,
        field: "autoMatches",
        headerClass: "!px-0 header-top-blue-border",
        cellClass: "justify-center",
        cellRenderer: PPCRankRenderer,
        hide: !isExpanded,
        resizable: false,
      },
      // {
      //   initialWidth: 80,
      //   headerName: "Org Sales",
      //   field: "orgSales",
      //   headerClass: "ag-header-right-text header-top-blue-border",
      //   cellClass: "text-right justify-end",
      //   valueFormatter: numberCellFormatter,
      //   hide: !isExpanded,
      // },
      {
        initialWidth: 80,
        headerName: "PPC Sales",
        field: "ppcSales",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        cellRenderer: ValueRenderer,
        valueFormatter: (value: ValueFormatterParams) =>
          numberCellFormatter(value, "", "0,0"),
        hide: !isExpanded,
        resizable: false,
      },
      {
        initialWidth: 80,
        headerName: "PPC Clicks",
        field: "totalClicks",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        cellRenderer: ValueRenderer,
        valueFormatter: (value: ValueFormatterParams) =>
          numberCellFormatter(value, "", "0,0"),
        hide: !isExpanded,
        resizable: false,
      },
      {
        initialWidth: 90,
        headerName: "PPC Spend",
        field: "ppcSpend",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        valueFormatter: (value) =>
          currencyCellFormatter(value, value.data.currency, "", "0,0"),
        cellRenderer: ValueRenderer,
        hide: !isExpanded,
        resizable: false,
      },
      {
        initialWidth: 80,
        headerName: "CPC",
        field: "costPerClicks",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        valueFormatter: (value) =>
          currencyCellFormatter(value, value.data.currency),
        cellRenderer: ValueRenderer,
        hide: !isExpanded,
        resizable: false,
      },
      {
        initialWidth: 80,
        headerName: "CTR",
        field: "clickThroughRate",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        cellRenderer: ValueRenderer,
        valueFormatter: (value: ValueFormatterParams) =>
          percentageCellFormatter(value, {
            formatType: "0,0.00",
          }),
        hide: !isExpanded,
        resizable: false,
      },
      {
        initialWidth: 80,
        headerName: "ACOS",
        field: "acos",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        cellRenderer: ValueRenderer,
        valueFormatter: (value: ValueFormatterParams) =>
          percentageCellFormatter(value, {
            formatType: "0,0.00",
          }),
        hide: !isExpanded,
        resizable: false,
      },
      {
        initialWidth: 80,
        headerName: "CVR",
        field: "conversionRate",
        headerClass: "ag-header-right-text header-top-blue-border",
        cellClass: "text-right justify-end",
        valueFormatter: (value: ValueFormatterParams) =>
          percentageCellFormatter(value, {
            formatType: "0,0.00",
          }),
        cellRenderer: ValueRenderer,
        headerComponent: AgHeaderRenderer,
        headerComponentParams: {
          content: <CVRHeaderRenderer />,
          reversed: true,
          className: "search-volume-header",
        },
        hide: !isExpanded,
        resizable: false,
      },
      ...dateColumns.map((date, index) => ({
        headerComponent: RankHeaderRenderer,
        headerComponentParams: {
          field: date,
          borderless: true,
          index,
        },
        resizable: false,
        field: date,
        cellRenderer: RankRenderer,
        cellRendererParams: {
          isRank: true,
          colIndex: index,
        },
        width: (() => {
          if (index === 0) {
            return isShowDualRank ? 70 : 48;
          }
          const dateObj = getDateFromString(date, timeZone);
          if (dateObj.getDate() === 1 && !isNaturalTimeline) {
            return 48;
          }

          if (
            dateObj.getDate() === endOfMonth(dateObj).getDate() &&
            isNaturalTimeline
          ) {
            return 48;
          }

          return 38;
        })(),
        cellClass: ({ node }: CellClassParams) => {
          return classNames(
            "!px-0 flex-1 !overflow-visible",
            !node.data.isAggregateRow && "pb-[1px]",
            index === 0 && "!justify-end"
          );
        },
        headerClass: classNames("!px-0", index === 0 && "!justify-end"),
      })),
    ] as ColDef[];
  }, [
    isNaturalTimeline,
    showConnectPpc,
    isRootMode,
    isExpanded,
    dateColumns,
    keywordHighlights,
    timeZone,
    isShowDualRank,
  ]);
};

export const useShowHighlightPanel = () => {
  const setSelectedDate = useSetRecoilState(selectedDateState);
  const setIsShowFilterPanel = useSetRecoilState(showFilterPanelState);
  const setIsShowHighlightPanel = useSetRecoilState(showHighlightPanelState);

  return useCallback(
    (mode: HighlightPanelMode) => {
      setSelectedDate("");
      setIsShowFilterPanel(false);
      setIsShowHighlightPanel(mode);
    },
    [setSelectedDate, setIsShowFilterPanel, setIsShowHighlightPanel]
  );
};

export const useShowFilterPanel = () => {
  const setSelectedDate = useSetRecoilState(selectedDateState);
  const setIsShowFilterPanel = useSetRecoilState(showFilterPanelState);
  const setIsShowHighlightPanel = useSetRecoilState(showHighlightPanelState);

  return useCallback(
    (isShow: boolean) => {
      setSelectedDate("");
      setIsShowHighlightPanel("");
      setIsShowFilterPanel(isShow);
    },
    [setSelectedDate, setIsShowFilterPanel, setIsShowHighlightPanel]
  );
};

export const useSetSelectedDate = () => {
  const setSelectedDate = useSetRecoilState(selectedDateState);
  const setIsShowFilterPanel = useSetRecoilState(showFilterPanelState);
  const setIsShowHighlightPanel = useSetRecoilState(showHighlightPanelState);

  return useCallback(
    (date: string) => {
      setIsShowHighlightPanel("");
      setIsShowFilterPanel(false);
      setSelectedDate(date);
    },
    [setSelectedDate, setIsShowFilterPanel, setIsShowHighlightPanel]
  );
};
