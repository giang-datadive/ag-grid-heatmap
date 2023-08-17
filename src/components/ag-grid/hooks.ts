import {
  CellPosition,
  ColDef,
  GridApi,
  RowNode,
  ColumnResizedEvent,
} from "ag-grid-community";
import {
  HTMLInputTypeAttribute,
  useCallback,
  useEffect,
  RefObject,
  useState,
  useMemo,
} from "react";
import {
  checkFocusedCellHasCheckbox,
  getCellValue,
  getIndexesOfSelectRows,
  getRowsDataFromGrid,
  stringifyToTabDelimitedCsv,
} from "./helpers";
import { chain, debounce } from "lodash";
import { useIsomorphicLayoutEffect } from "react-use";

//Adds a record after an index
export const useAddRecordsAfter = <T>(gridApi: GridApi) => {
  return useCallback(
    (records: T[], index: number) =>
      gridApi.applyTransaction({
        add: records,
        addIndex: index + 1,
      }),
    [gridApi]
  );
};

//This setter function is called from AG-Grid used to set value to state
export const useAgShortcutKeys = (
  gridApi: GridApi,
  listener?: { onRemove?: () => void }
) => {
  const removeRecords = useRemoveRecords(gridApi);
  const toggleAgCheckbox = useToggleAgCheckbox(gridApi);
  const keydownListener = useCallback(
    (ev: any) => {
      preventOverridingNativeShortcutOnInput(
        ev,
        () => {
          if (!gridApi) return;
          if (
            (ev.key === "Delete" || ev.key === "Backspace") &&
            gridApi?.getSelectedNodes().length
          ) {
            removeRecords(getIndexesOfSelectRows(gridApi));
            if (listener && listener.onRemove) {
              listener.onRemove();
            }
          }
          if (ev.key === "Enter" && checkFocusedCellHasCheckbox(gridApi)) {
            toggleAgCheckbox(gridApi.getFocusedCell() as CellPosition);
          }
        },
        {
          ignoreTypes: ["checkbox"],
        }
      );
    },
    [removeRecords, toggleAgCheckbox, gridApi, listener]
  );

  useEffect(() => {
    document.body.addEventListener("keydown", keydownListener);
    return () => {
      document.body.removeEventListener("keydown", keydownListener);
    };
  }, [keydownListener]);
};

/**
 * Get all the columns without parent and child hierarchy
 *
 * @param gridApi
 * @returns
 */
const getFlattenColumns = (gridApi: GridApi) => {
  const columnDefs = gridApi.getColumnDefs();
  if (!columnDefs) return [];
  return columnDefs
    .reduce((columns: ColDef[], column) => {
      if ("children" in column) {
        columns = columns.concat(column.children);
      } else {
        columns.push(column);
      }
      return columns;
    }, [])
    .map((c) => ({
      field: "field" in c && c.field ? c.field : "",
      title: c.headerName || "",
    }));
};

//Removes a record from index(s)
export const useRemoveRecords = (gridApi: GridApi) => {
  return (indexes: number[]) => {
    gridApi.applyTransaction({
      remove: getRowsDataFromGrid(gridApi, indexes),
    });
  };
};

export const useToggleAgCheckbox = (gridApi?: GridApi) => {
  return (focusedCell: CellPosition) => {
    if (!gridApi) return;
    const focusedCellRow = gridApi.getDisplayedRowAtIndex(
      focusedCell?.rowIndex as number
    ) as RowNode;
    const columnKey = focusedCell.column.getColId();
    focusedCellRow.setDataValue(
      columnKey,
      !focusedCellRow.data[columnKey],
      "AgCheckboxToggle"
    );
  };
};

/**
 * Change checked state of ag-grid checkbox when press "space"
 * @param gridApi: ag grid API object
 * @param allowColumns: array of column id that allow change when press space
 * @param selectColumn: id of select column which is column that use to select row (check box)
 * @param onChange: Callback when changed
 */
export const useChangeSpaceBehavior = (
  gridApi?: GridApi,
  allowColumns: string[] = [],
  selectColumn = "select",
  onChange?: (nodes: RowNode[], checked: boolean) => void,
  disabled?: boolean
) => {
  const toggleAgCheckbox = useToggleAgCheckbox(gridApi);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetEl = e.target as HTMLElement;
      const isEditableTarget =
        targetEl.tagName === "TEXTAREA" ||
        targetEl.isContentEditable ||
        (targetEl.tagName === "INPUT" &&
          targetEl.getAttribute("type") === "text");

      if (!gridApi || isEditableTarget) return;
      gridApi.getCellRanges()?.forEach((cellRange) => {
        if (!cellRange) return;

        const columnRangeIds = cellRange.columns.map((col) => col.getColId());
        const isValidColumn = columnRangeIds.some(
          (colId) => colId === selectColumn || allowColumns.includes(colId)
        );
        if (e.code === "Space" && isValidColumn) {
          e.preventDefault();
          e.stopPropagation();
          if (disabled) return;

          const { startRow, endRow } = cellRange;
          const startRowIndex = Math.min(
            startRow?.rowIndex || -1,
            endRow?.rowIndex || -1
          );
          const endRowIndex = Math.max(
            startRow?.rowIndex || 0,
            endRow?.rowIndex || 0
          );
          const selectColumnIds = columnRangeIds.filter(
            (colId) => colId === selectColumn || allowColumns.includes(colId)
          );
          const selectedRows: RowNode[] = [];
          //Get selected rows
          for (let i = startRowIndex; i <= endRowIndex; i++) {
            const row = gridApi.getDisplayedRowAtIndex(i);
            if (row) {
              selectedRows.push(row);
            }
          }
          //Get next current checked value
          const isAllChecked = selectedRows.every((node) => {
            const { data } = node;
            return selectColumnIds.every((field) => {
              if (field === selectColumn) {
                return node.isSelected();
              }
              // Ignore the null value
              if (data[field] === null) return true;

              return data[field];
            });
          });
          const changeNodes: RowNode[] = [];
          selectedRows.forEach((rowNode) => {
            selectColumnIds.forEach((field) => {
              changeNodes.push(rowNode);
              if (field === selectColumn) {
                rowNode.setSelected(!isAllChecked);
              } else {
                rowNode.setDataValue(field, !isAllChecked, "AgCheckboxToggle");
              }
            });
          });
          onChange && onChange(changeNodes, !isAllChecked);
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    gridApi,
    toggleAgCheckbox,
    allowColumns,
    selectColumn,
    onChange,
    disabled,
  ]);
};

/**
 * Change checked state of ag-grid checkbox when press "space"
 * @param gridApi: ag grid API object
 * @param allowColumns: array of column id that allow change when press space
 * @param selectColumn: id of select column which is column that use to select row (check box)
 * @param onChange: Callback when changed
 */
export const useChangeSpaceBehaviorNiche = (
  gridApi?: GridApi,
  allowColumns: string[] = [],
  selectColumn = "select",
  onChange?: (nodes: RowNode[], checked: boolean) => void
) => {
  useChangeSpaceBehavior(gridApi, allowColumns, selectColumn, onChange);
};

export const preventOverridingNativeShortcutOnInput = (
  event: Event,
  callback: (event: Event) => void,
  options?: { ignoreTypes?: HTMLInputTypeAttribute[] }
) => {
  const target = event.target as HTMLElement;
  const isInput = target.tagName === "INPUT";
  const type = target.getAttribute("type");
  const isActive = document.activeElement === target;
  const shouldIgnore =
    isInput && !!type && !!options?.ignoreTypes?.includes(type);

  if (isInput && isActive && !shouldIgnore) return;

  callback(event);
};

export const useAgGridScrollBehaviour = (
  parentRef: RefObject<HTMLDivElement>,
  lockVerticalScrollOnShift = true,
  speed = 1
) => {
  const { current } = parentRef;
  useEffect(() => {
    if (!current) {
      return;
    }
    // This element is used for HORIZONTAL scroll
    const colViewPorts = current?.getElementsByClassName(
      "ag-center-cols-viewport"
    );
    // This element is used for VERTICAL scroll
    const bodyViewPorts = current?.getElementsByClassName("ag-body-viewport");
    const handleScroll = (evt: WheelEvent) => {
      if (current?.querySelector(".ddgrid-overlay")) return;

      const verticalScrollLocked = evt.shiftKey && lockVerticalScrollOnShift;
      const deltaX = evt.deltaX * speed;
      const deltaY = verticalScrollLocked ? 0 : evt.deltaY * speed;

      colViewPorts?.[colViewPorts?.length - 1]?.scrollBy(deltaX, deltaY);
      bodyViewPorts?.[bodyViewPorts?.length - 1]?.scrollBy(deltaX, deltaY);
    };
    // Ag-Grid has "viewport" containers that respond to scroll events.
    // Since we want the scroll to happen when mouse is hovered over anywhere on the table,
    // We'll just receive the mouse "wheel" event and scroll the viewport manually.
    current.addEventListener("wheel", handleScroll);
    return () => {
      current?.removeEventListener("wheel", handleScroll);
    };
  }, [current, lockVerticalScrollOnShift, speed]);
};

declare global {
  interface Event {
    clipboardData: DataTransfer;
  }
}

export const useBeforePaste = (
  gridApi: GridApi | undefined,
  acceptedColumns: string[]
) => {
  const getTotalRowsLength = (gridApi: GridApi) => {
    let totalRow = 0;
    gridApi.forEachNode(() => {
      totalRow++;
    });

    return totalRow - 1;
  };

  useEffect(() => {
    const handlePaste = (e: Event) => {
      if (!gridApi) {
        return;
      }
      const focusedCell = gridApi.getFocusedCell();
      if (
        !focusedCell ||
        !acceptedColumns.includes(focusedCell?.column?.getColId() || "")
      ) {
        return;
      }
      // Not use navigator.clipboard beacuse it is async so, ag-grid will paste data before insert rows
      const pasteData = e.clipboardData.getData("Text");
      const totalPastedRow = pasteData.split("\n").length;
      const numberRowAppend =
        focusedCell?.rowIndex + totalPastedRow - getTotalRowsLength(gridApi);

      if (numberRowAppend > 0) {
        gridApi.applyTransaction({
          add: [...Array(numberRowAppend)].map(() => ({})),
        });
      }
    };
    document.body.addEventListener("paste", handlePaste);

    return () => {
      document.body.removeEventListener("paste", handlePaste);
    };
  }, [gridApi, acceptedColumns]);
};

export const useSyncColumnWidth = (colPrefix: string) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    debounce(({ column, columnApi }: ColumnResizedEvent) => {
      const resizedColumnId = column?.getColId();
      const resizedColumnNewWidth = column?.getActualWidth();
      if (
        resizedColumnId == null ||
        resizedColumnNewWidth == null ||
        !resizedColumnId.startsWith(colPrefix)
      )
        return;

      columnApi.setColumnWidths(
        chain(columnApi.getAllColumns())
          .filter((col) => col.getColId().startsWith(colPrefix))
          .map((col) => ({
            key: col.getColId(),
            newWidth: resizedColumnNewWidth,
          }))
          .value()
      );
    }, 200 / 6),
    []
  );
};

export const useAlignStatusBar = ({
  containerId = "",
  showStatusBar = false,
  filterEnabled = false,
  statusBarHeight = 32,
  headerBaseHeight = 40,
  filterBarHeight = 30,
} = {}) => {
  useIsomorphicLayoutEffect(() => {
    if (!containerId) return;

    const tableContainer = document.getElementById(containerId);
    const gridBodyViewPort = tableContainer?.querySelector(
      ".ag-body-viewport"
    ) as HTMLElement;
    const gridFloatingTop = tableContainer?.querySelector(
      ".ag-floating-top"
    ) as HTMLElement;

    if (gridBodyViewPort) {
      gridBodyViewPort.style.top = showStatusBar
        ? `${statusBarHeight}px`
        : "unset";
      gridBodyViewPort.style.paddingBottom = showStatusBar
        ? `${statusBarHeight}px`
        : "unset";
    }
    if (gridFloatingTop) {
      gridFloatingTop.style.top = showStatusBar
        ? `${statusBarHeight}px`
        : "unset";
    }

    const gridHeader = tableContainer?.querySelector(
      ".ag-header"
    ) as HTMLElement;
    const gridStatusBar = tableContainer?.querySelector(
      ".status-bar"
    ) as HTMLElement;

    if (gridHeader) {
      gridHeader.style.minHeight = filterEnabled
        ? `${headerBaseHeight + filterBarHeight}px`
        : `${headerBaseHeight}px`;
      gridHeader.style.height = filterEnabled
        ? `${headerBaseHeight + filterBarHeight}px`
        : `${headerBaseHeight}px`;
    }
    if (gridStatusBar) {
      gridStatusBar.style.top = filterEnabled
        ? `${headerBaseHeight + filterBarHeight}px`
        : `${headerBaseHeight}px`;
    }
  }, [containerId, showStatusBar, filterEnabled]);
};

export const useGridLockOnDataUpdate = <T>(initialData: T, delay = 133) => {
  const [data, setData] = useState(() => initialData);
  const [gridLock, setGridLock] = useState(false);
  const debouncedSetData = useMemo(
    () =>
      debounce((d: T) => {
        setData(d);
        setGridLock(false);
      }, delay),
    [delay]
  );

  useIsomorphicLayoutEffect(() => {
    setGridLock(true);
    debouncedSetData(initialData);
  }, [initialData, debouncedSetData]);

  return {
    data,
    setData,
    gridLock,
  };
};
