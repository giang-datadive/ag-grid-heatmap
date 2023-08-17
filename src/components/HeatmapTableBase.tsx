import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColDef,
  GridApi,
  RowHeightParams,
  RowNode,
  RowSelectedEvent,
  SideBarDef,
} from "ag-grid-community";
import { DDGrid } from "./ag-grid";
import classNames from "classnames";
import krtClasses from "./rank-radar.module.scss";
import {
  getAgColumnsToolPanelDef,
  getAgExportToolPanelDef,
} from "./ag-grid/common";
import { AgExportToolPanelProps } from "./ag-grid/AgExportToolPanel";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  heatmapIsExpandedState,
  heatmapRankTypeState,
  hoveredColumnState,
  isRootModeState,
  selectedRowsState,
} from "../atoms/rank-radar";
import { useChangeSpaceBehavior } from "./ag-grid/hooks";
import {
  useDateColumns,
  useIsShowDualRank,
  useKrtId,
  useSelectedKrt,
} from "../hooks";
import { Spin } from "antd";
import { kebabCase } from "lodash";
import { HeatmapRow } from "../types/rank-radar";
import RootRenderer from "../cell-renderers/RootRenderer";
import AgHeaderRenderer from "./ag-grid/AgHeaderRenderer";
import RootHeaderRenderer from "../cell-renderers/RootHeaderRenderer";
import {
  heatmapAggregateRowSelector,
  heatmapRowsSelector,
  hasPPCDataSelector,
  keywordsHighlightsSelector,
  showConnectPPCSelector,
  isNatualTimelineSelector,
} from "../selectors/rank-radar";

interface HeatmapTableProps {
  columnDefs: ColDef[];
  isLoading: boolean;
  className?: string;
  treeData?: boolean;
}

const HeatmapTableBase = ({
  columnDefs,
  isLoading,
  className,
  treeData,
}: HeatmapTableProps) => {
  const [selectedRows, setSelectedRows] = useRecoilState(selectedRowsState);
  const heatmapRows = useRecoilValue(heatmapRowsSelector);
  const heatmapAggRow = useRecoilValue(heatmapAggregateRowSelector);
  const [gridApi, setGridApi] = useState<GridApi>();
  const isShowDualRank = useIsShowDualRank();
  const selectedKrt = useSelectedKrt();
  const dateColumns = useDateColumns();
  const keywordHighlights = useRecoilValue(keywordsHighlightsSelector);
  const rankType = useRecoilValue(heatmapRankTypeState);
  const isRootMode = useRecoilValue(isRootModeState);
  const setHoveredColumn = useSetRecoilState(hoveredColumnState);
  const hasPPCData = useRecoilValue(hasPPCDataSelector);
  const showConnectPPC = useRecoilValue(showConnectPPCSelector);
  const isExpanded = useRecoilValue(heatmapIsExpandedState);
  const krtId = useKrtId();
  const isNaturalTimeline = useRecoilValue(isNatualTimelineSelector);

  useEffect(() => {
    requestAnimationFrame(() => {
      gridApi?.resetRowHeights();
      const pinnedRowNode = gridApi?.getPinnedTopRow(0);
      pinnedRowNode?.setRowHeight(isShowDualRank ? 75 : 44);
    });
  }, [isShowDualRank, gridApi]);

  useEffect(() => {
    if (isLoading) {
      gridApi?.showLoadingOverlay();
    } else {
      gridApi?.hideOverlay();
    }
  }, [isLoading, gridApi]);

  const showStatusBar = selectedRows.length;

  useEffect(() => {
    gridApi?.refreshHeader();
  }, [isNaturalTimeline, gridApi]);

  useChangeSpaceBehavior(gridApi);

  const sidebar: SideBarDef = useMemo(
    () => ({
      toolPanels: [
        getAgColumnsToolPanelDef(),
        getAgExportToolPanelDef({
          toolPanelParams: {
            fileName: kebabCase(selectedKrt?.stats?.title || "rank-radar"),
            processCellCallback: ({ column, value, node }) => {
              const colId = column.getId();
              if (colId === "keywordHighlights") {
                const highlights = keywordHighlights[node?.data?.id] || [];
                return highlights.map((item) => item.title).join(", ");
              }

              if (dateColumns.includes(colId)) {
                const organicRank = node?.data?.organicRankData?.[colId] || "";
                const impressionRank =
                  node?.data?.impressionRankData?.[colId] || "";

                if (rankType === "organic") return organicRank;

                if (rankType === "impression") return impressionRank;

                return organicRank && impressionRank
                  ? `${organicRank} / ${impressionRank}`
                  : "";
              }

              return value;
            },
          } as AgExportToolPanelProps,
        }),
      ],
    }),
    [selectedKrt, rankType, dateColumns, keywordHighlights]
  );

  const handleSelectedRowsChange = useCallback(
    ({ api }: RowSelectedEvent) => {
      setSelectedRows(api.getSelectedRows());
    },
    [setSelectedRows]
  );

  const getGridRowHeight = ({ node }: RowHeightParams) => {
    if (node.rowIndex === 0) {
      return isShowDualRank ? 75 : 34;
    }

    if (node.data.isAggregateRow) {
      return isShowDualRank ? 74 : 44;
    }

    return isShowDualRank ? 70 : 30;
  };

  const getDataPath = useMemo(() => {
    return (data: HeatmapRow) => data.orgHierarchy || [data.id];
  }, []);

  const autoGroupColumnDef = useMemo(() => {
    return {
      headerComponent: AgHeaderRenderer,
      headerComponentParams: {
        content: <RootHeaderRenderer />,
        className: "gap-2",
      },
      sortable: true,
      cellRenderer: RootRenderer,
      width: 110,
      pinned: true,
      comparator: (_: string, __: string, nodeA: RowNode, nodeB: RowNode) => {
        const numberOfHighlightA =
          keywordHighlights[nodeA.data.id]?.length || 0;
        const numberOfHighlightB =
          keywordHighlights[nodeB.data.id]?.length || 0;

        return numberOfHighlightA - numberOfHighlightB;
      },
    };
  }, [keywordHighlights]);

  return (
    <div
      className={classNames(
        "p-4 flex flex-col flex-1 pr-0 pb-0 pt-1 w-full",
        className
      )}
      onMouseLeave={() => setHoveredColumn("")}
    >
      <div
        className={classNames(
          "flex-1 flex ag-theme-datadive-grid relative w-full",
          krtClasses["kw-rank-tracker-table"],
          krtClasses["keyword-table"],
          krtClasses["heatmap-table"],
          isShowDualRank && krtClasses["heatmap-dual-rank"],
          !isShowDualRank && krtClasses["heatmap-single-rank"],
          isShowDualRank && selectedRows.length && krtClasses["has-status-bar"],
          isRootMode && krtClasses["heatmap-root-mode"],
          !hasPPCData &&
            isExpanded &&
            showConnectPPC &&
            krtClasses["connect-ppc-data"]
        )}
      >
        <DDGrid
          preferenceKey={krtId}
          containerClassName={classNames("flex-1", {
            "hide-status-bar": !showStatusBar,
          })}
          rowBuffer={5}
          treeData={treeData}
          getDataPath={getDataPath}
          autoGroupColumnDef={autoGroupColumnDef}
          suppressContextMenu
          getRowId={({ data }) => data.rowId}
          resetRowDataOnUpdate={false}
          suppressRowClickSelection={true}
          onRowSelected={handleSelectedRowsChange}
          headerHeight={72}
          gridName="keywordTable"
          eventCategory="keywordRankTracker"
          rowData={heatmapRows}
          sideBar={sidebar}
          rowSelection="multiple"
          columnDefs={columnDefs}
          maintainColumnOrder={false}
          getRowHeight={getGridRowHeight}
          pinnedTopRowData={heatmapAggRow ? [heatmapAggRow] : undefined}
          onGridReady={(e) => setGridApi(e.api)}
          loadingOverlayComponent={Spin}
          defaultColDef={{
            resizable: true,
            sortable: true,
            unSortIcon: true,
            suppressMovable: true,
            lockPosition: true,
            lockPinned: true,
            suppressMenu: true,
          }}
        />

        <div className="w-[10px] h-[10px] top-[10px] absolute bg-[#E2E9F0] z-10 left-0">
          <div className="absolute bg-white w-[10px] h-[10px] rounded-tl-[8px] left-0" />
        </div>
        <div className="w-[10px] h-[10px] top-[10px] absolute bg-[#E2E9F0] z-10 right-0">
          <div className="absolute bg-white w-[16px] h-[10px] rounded-tr-[8px] -left-[6px]" />
        </div>
      </div>
    </div>
  );
};

export default HeatmapTableBase;
