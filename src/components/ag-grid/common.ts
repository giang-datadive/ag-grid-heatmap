import {
  GetContextMenuItemsParams,
  MenuItemDef,
  ToolPanelDef,
} from "ag-grid-community";
import AgExportToolPanel, { AgExportToolPanelProps } from "./AgExportToolPanel";
import { useCallback } from "react";
import { atom } from "recoil";
import { getCellRangeValues } from "./helpers";
import {
  GridPreference,
  GridPreferenceState,
  GridPreferenceTypes,
} from "./types";
import { difference } from "lodash";

export const getAgExportToolPanelDef = (
  override?: {
    toolPanelParams?: AgExportToolPanelProps;
  } & Partial<ToolPanelDef>
) => ({
  id: "export",
  labelDefault: "Export",
  labelKey: "export",
  iconKey: "save",
  toolPanel: AgExportToolPanel,
  ...(override || {}),
});

export const getAgColumnsToolPanelDef = (override?: Partial<ToolPanelDef>) => ({
  id: "columns",
  labelDefault: "Columns",
  labelKey: "columns",
  iconKey: "columns",
  toolPanel: "agColumnsToolPanel",
  toolPanelParams: {
    suppressRowGroups: true,
    suppressValues: true,
    suppressPivots: true,
    suppressPivotMode: true,
    suppressColumnMove: true,
  },
  ...(override || {}),
});

export const getDefaultContextMenuItems = () => [
  "copy",
  "copyWithHeaders",
  "paste",
  "separator",
  "export",
];

type AgGridContextMenu = string | MenuItemDef;
export const useContextMenuWithExclusion = (
  gridName?: string,
  callback?: (keywords: string[]) => void,
  menuFormat?: (
    valuesInRange: string[],
    exclusionMenus: AgGridContextMenu[],
    defaultMenus: AgGridContextMenu[]
  ) => AgGridContextMenu[]
) => {
  return useCallback(
    ({
      context,
      column,
      api,
    }: GetContextMenuItemsParams): AgGridContextMenu[] => {
      if (!column) return [];
      const allowExclusionsColumn = context.allowExclusionsColumn as string[];
      const columnId = column?.getColId();
      const columnField = column?.getColDef()?.field;
      const isAllowedColumn = allowExclusionsColumn.includes(columnId);
      if (!isAllowedColumn) return getDefaultContextMenuItems();

      const valuesInRange = getCellRangeValues(api, columnField);
      const exactKeywordsToExclude = difference(
        valuesInRange,
        []
        // mklFilterSettings.keywordExclusions.map((exc) => exc.keyword)
      );
      const phraseKeywordToExclude = difference(
        valuesInRange,
        []
        // mklFilterSettings.phraseExclusions.map((exc) => exc.phrase)
      );
      const excludeKeywordAvailable = exactKeywordsToExclude.length > 0;
      const excludePhraseAvailable = phraseKeywordToExclude.length > 0;
      const exclusionMenuItems =
        excludeKeywordAvailable || excludePhraseAvailable
          ? [
              {
                name: `Exclude ${valuesInRange.length} KWs in...`,
                icon: `<span class="ag-icon ag-icon-unlinked" unselectable="on" role="presentation"></span>`,
                subMenu: [
                  excludeKeywordAvailable && {
                    name: "EXACT form",
                    action: () => {
                      callback?.(valuesInRange);
                    },
                  },
                  excludePhraseAvailable && {
                    name: "PHRASE form",
                    action: () => {
                      callback?.(valuesInRange);
                    },
                  },
                ].filter((i) => !!i) as MenuItemDef[],
              },
              "separator",
            ]
          : [];
      return menuFormat
        ? menuFormat(
            valuesInRange,
            exclusionMenuItems,
            getDefaultContextMenuItems()
          )
        : [...exclusionMenuItems, ...getDefaultContextMenuItems()];
    },
    [gridName, callback, menuFormat]
  );
};

export const defaultAgNumberColumnFilterParams = {
  allowedCharPattern: "/\\-?\\d*(\\.\\d+)?/",
};

export const createGridPreferenceState = (
  key: string,
  type: GridPreferenceTypes
): GridPreferenceState => {
  return {
    atom: atom<GridPreference>({
      key,
      default: {},
    }),
    type,
  };
};
