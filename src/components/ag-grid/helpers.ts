import {
  CellPosition,
  GetContextMenuItemsParams,
  GridApi,
  ITooltipParams,
  ProcessCellForExportParams,
  RowNode,
  ValueFormatterParams,
  ValueGetterParams,
  ValueParserParams,
  ColumnState,
} from "ag-grid-community";
import { get, isFunction, chain, isNumber } from "lodash";
import { IServerSideDatasource } from "ag-grid-enterprise";

const MAX_JS_RANK = 101;

export const getRowsDataFromGrid = <T>(
  gridApi: GridApi | undefined,
  indexes: number[]
) => {
  const rowData: T[] = [];
  gridApi?.forEachNodeAfterFilterAndSort((rowNode, index) => {
    if (indexes.includes(index)) rowData.push(rowNode.data);
  });
  return rowData;
};

export const getRowsDataFromGridInRange = <T>(
  gridApi: GridApi | undefined,
  start: number,
  end: number
) => {
  const rowData: T[] = [];
  gridApi?.forEachNodeAfterFilterAndSort((rowNode, index) => {
    if (index >= start && index <= end) rowData.push(rowNode.data);
  });
  return rowData;
};

export const getIndexesOfSelectRows = (gridApi: GridApi) =>
  gridApi
    .getSelectedNodes()
    .map((selectedRow) => selectedRow.rowIndex as number);

export const getCellValue = (gridApi: GridApi, cell: CellPosition) => {
  const focusedCellRow = gridApi.getDisplayedRowAtIndex(cell.rowIndex);
  return gridApi.getValue(cell.column.getColId(), focusedCellRow as RowNode);
};

export const numberCellFormatter = (
  { value }: ValueFormatterParams,
  defaultEmpty = "",
  formatType?: string
) => {
  if (value === null || value === undefined) return defaultEmpty;
  return value;
};
export const currencyCellFormatter = (
  { value, data }: ValueFormatterParams,
  marketplace?: string,
  defaultEmpty = "",
  formatType?: string
): string => {
  if (value === null || value === undefined) return defaultEmpty;
  const selectedMarketplace = marketplace || data?.marketplace;
  if (!selectedMarketplace) return "#error";

  return value;
};

export const percentageCellFormatter = (
  { value }: ValueFormatterParams,
  {
    defaultEmpty,
    formatType,
    rounded,
  }: {
    defaultEmpty?: string;
    formatType?: string;
    rounded?: boolean;
  } = {}
): string => {
  if (value === null || value === undefined) return defaultEmpty || "";
  return `${value}%`;
};

export const stringifyToTabDelimitedCsv = <T extends object>(
  data: T[],
  columns: Array<{ field: string; title: string }>
): string => {
  const delimiter = "\t";
  return data.reduce((csv, d) => {
    const row = columns.reduce((current, column) => {
      const key = column.field;
      current += current.length > 0 ? delimiter : "";
      current += (d as any)[key] != null ? (d as any)[key] : "";
      return current;
    }, "");

    csv += row + "\n";
    return csv;
  }, "");
};

export const checkFocusedCellHasCheckbox = (gridApi: GridApi) => {
  const cellRendererCompName = gridApi
    .getFocusedCell()
    ?.column.getUserProvidedColDef()?.cellRenderer?.name;
  return ["AgSwitchRenderer", "AgCheckboxRenderer"].some(
    (componentName) => cellRendererCompName === componentName
  );
};

export const processCellForExportWithFormattedValue = (
  params: ProcessCellForExportParams
) => {
  // ignored number format columns while exporting it to excel/csv,
  // so that it can be sorted as a number.
  if (isNumber(params.value)) return params.value;

  const colDef = params.column.getColDef();
  if (colDef.valueFormatter && isFunction(colDef.valueFormatter)) {
    return colDef.valueFormatter({
      ...params,
      data: params.node?.data,
      colDef: colDef,
    } as ValueFormatterParams);
  }

  return params.value;
};

export const getCellRangeValues = (
  gridApi: GridApi,
  colField?: string
): string[] => {
  const values: string[] = [];
  const ranges = gridApi?.getCellRanges();
  ranges?.forEach((range) => {
    if (!range.startRow || !range.endRow) return;
    // Pass correct range start to end, even though selection can be in any direction up->down or down->up
    const startRow =
      range.startRow.rowIndex <= range.endRow.rowIndex
        ? range.startRow
        : range.endRow;
    const endRow =
      range.startRow.rowIndex <= range.endRow.rowIndex
        ? range.endRow
        : range.startRow;
    const rowsData = getRowsDataFromGridInRange<any>(
      gridApi,
      startRow.rowIndex,
      endRow.rowIndex
    );

    if (colField)
      rowsData.forEach((rowData) => {
        //getting value using the dot notation as well
        const value = get(rowData, colField);
        if (rowData && value) values.push(value);
      });
  });
  return values;
};

export const EmptyDataSource: IServerSideDatasource = {
  getRows: async () => undefined,
};
