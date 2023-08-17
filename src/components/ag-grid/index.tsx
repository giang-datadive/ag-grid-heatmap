import { AgGridReact, AgGridReactProps } from "ag-grid-react";
import {
  ColumnMovedEvent,
  ColumnResizedEvent,
  ColumnVisibleEvent,
  FilterChangedEvent,
  GridApi,
  PasteEndEvent,
  RowDragEvent,
  RowSelectedEvent,
  SortChangedEvent,
} from "ag-grid-community";
import {
  useState,
  useRef,
  useCallback,
  useMemo,
  CSSProperties,
  MutableRefObject,
} from "react";
import {
  usePersistentGridColumnDefs,
  useGridPreferenceCallbacks,
} from "./hooks/ag-grid-user-preference";
import { useCloseToolPanelOnClickAway } from "./hooks/ag-close-toolpanel";
import { GridPreferenceState } from "./types";
import { uniqueId } from "lodash";
import useAgGridScrollableHeaders from "./hooks/ag-header-scroll";
import { EmptyDataSource } from "./helpers";
import classNames from "classnames";

const TOOLTIP_SHOW_DELAY = 150;

interface DDGridProps extends AgGridReactProps {
  /**
   * Provide gridPreferenceState to enable Grid state/filter persistence
   */
  gridPreferenceState?: GridPreferenceState;
  gridName: string;
  eventCategory: string;
  suppressHeaderScrolling?: boolean;
  containerClassName?: string;
  containerId?: string;
  containerStyle?: CSSProperties;
  containerRef?: MutableRefObject<HTMLDivElement | null>;
  hasOverlay?: boolean;
  preferenceKey?: string;
}

const defaultAgGridReactProps: Partial<DDGridProps> = {
  maintainColumnOrder: true,
  tooltipShowDelay: TOOLTIP_SHOW_DELAY,
  tooltipMouseTrack: true,
  enableRangeSelection: true,
  suppressScrollOnNewData: true,
};

export const DDGrid = (props: DDGridProps) => {
  const [isLoadedPreference, setIsLoadedPreference] = useState(false);
  const {
    gridPreferenceState,
    columnDefs,
    gridName,
    onGridReady,
    onFilterChanged,
    onSortChanged,
    onColumnResized,
    onColumnVisible,
    onColumnMoved,
    onRowSelected,
    onRowDragEnd,
    onPasteEnd,
    eventCategory,
    maintainColumnOrder,
    suppressHeaderScrolling,
    resetRowDataOnUpdate,
    serverSideDatasource,
    containerClassName,
    containerId,
    containerStyle,
    containerRef,
    hasOverlay = false,
    preferenceKey,
    ...restProps
  } = {
    ...defaultAgGridReactProps,
    ...props,
  };

  const persistColumnDefs = usePersistentGridColumnDefs(
    columnDefs,
    gridPreferenceState,
    maintainColumnOrder
  );
  const initializeGridPreference = useGridPreferenceCallbacks(
    gridPreferenceState,
    maintainColumnOrder,
    preferenceKey
  );

  const gridRef = useRef<GridApi>();
  const [, setReady] = useState(false);
  const [tableId, setTableId] = useState<string | null>();
  useCloseToolPanelOnClickAway(gridRef.current as GridApi);
  useAgGridScrollableHeaders(`.${tableId}`, suppressHeaderScrolling);

  const ddOnFilterChanged = useCallback(
    (e: FilterChangedEvent) => {
      onFilterChanged && onFilterChanged(e);
      const headerName = e.columns?.[0]?.getColDef()?.headerName;
    },
    [onFilterChanged, gridName, eventCategory]
  );
  const ddOnSortChanged = useCallback(
    (e: SortChangedEvent) => {
      onSortChanged && onSortChanged(e);
    },
    [onSortChanged, gridName, eventCategory]
  );
  const ddOnColumnResized = useCallback(
    (e: ColumnResizedEvent) => {
      onColumnResized && onColumnResized(e);
    },
    [onColumnResized, gridName, eventCategory]
  );
  const ddOnColumnMoved = useCallback(
    (e: ColumnMovedEvent) => {
      onColumnMoved && onColumnMoved(e);
      const headerName = e.column?.getColDef()?.headerName;
    },
    [onColumnMoved, gridName, eventCategory]
  );
  const ddOnColumnVisible = useCallback(
    (e: ColumnVisibleEvent) => {
      onColumnVisible && onColumnVisible(e);
      const headerName = e.column?.getColDef()?.headerName;
    },
    [onColumnVisible, gridName, eventCategory]
  );
  const ddOnRowSelected = useCallback(
    (e: RowSelectedEvent) => {
      onRowSelected && onRowSelected(e);
    },
    [onRowSelected, gridName, eventCategory]
  );
  const ddOnRowDragEnd = useCallback(
    (e: RowDragEvent) => {
      onRowDragEnd && onRowDragEnd(e);
    },
    [onRowDragEnd, gridName, eventCategory]
  );
  const ddOnPasteEnd = useCallback(
    (e: PasteEndEvent) => {
      onPasteEnd && onPasteEnd(e);
    },
    [onPasteEnd, gridName, eventCategory]
  );

  const serverDataSource = useMemo(() => {
    if (!serverSideDatasource) {
      return serverSideDatasource;
    }
    return isLoadedPreference ? serverSideDatasource : EmptyDataSource;
  }, [serverSideDatasource, isLoadedPreference]);

  return (
    <div
      ref={containerRef}
      id={containerId}
      className={classNames("relative", containerClassName)}
      style={containerStyle}
    >
      <AgGridReact
        {...restProps}
        serverSideDatasource={serverDataSource}
        maintainColumnOrder={maintainColumnOrder}
        columnDefs={persistColumnDefs}
        onGridReady={async (evt) => {
          // Grid API must be assigned first before any state update
          gridRef.current = evt.api;

          await initializeGridPreference(evt);
          setReady(true);
          setIsLoadedPreference(true);
          setTableId(uniqueId("ddgrid-"));
          if (onGridReady) onGridReady(evt);
        }}
        onFilterChanged={ddOnFilterChanged}
        onSortChanged={ddOnSortChanged}
        onColumnResized={ddOnColumnResized}
        onColumnMoved={ddOnColumnMoved}
        onColumnVisible={ddOnColumnVisible}
        onRowSelected={ddOnRowSelected}
        onRowDragEnd={ddOnRowDragEnd}
        onPasteEnd={ddOnPasteEnd}
        resetRowDataOnUpdate={resetRowDataOnUpdate ?? !!props.getRowId}
        className={classNames(tableId, restProps.className)}
      />
      {hasOverlay && (
        <div className="ddgrid-overlay absolute inset-0 bg-gray-100 opacity-20 z-[999]"></div>
      )}
    </div>
  );
};
