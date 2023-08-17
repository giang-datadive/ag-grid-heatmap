import { ColumnState, RowNode } from "ag-grid-community"
import { RecoilState } from "recoil"
import { FilterModel } from "types/niche-pipeline"

export type GridPreference = {
  columnsState?: ColumnState[]
  columnsGroupState?: ColumnGroupState[]
  filter?: FilterModel
}

export type GridPreferenceTypes =
  | "allPreferencesOnNicheLevel"
  | "allPreferencesOnPageLevel"
  | "filterPerNicheAndRestOnPageLevel"

export interface GridPreferenceState {
  atom: RecoilState<GridPreference>
  type: GridPreferenceTypes
}

export type SortModel = {
  colId: string | undefined
  sort: string | null | undefined
}

export type ColumnGroupState = {
  groupId: string
  open: boolean
}

export type CustomAgSwitchSelectProps<T> = {
  /**
   * Overrides the checked state of the checkbox.
   * */
  isChecked?: boolean
  onChange?: (isChecked: boolean, params: T) => void

  /**
   * If true, the checkbox will be checked based on the row's selection state.
   * Using the default AG-Grid checkboxSelection prop causes the default ag-Grid checkbox to be rendered.
   * */
  checkboxSelection?: boolean

  /**
   * The checkbox in the header cell will be checked based on the custom condition, otherwise
   * it will be checked based on whether all rows are selected.
   * */
  customAllCheckedCondition?: (rowNode: RowNode) => boolean

  maxRowsSelectable?: number

  disabled?: boolean
}
