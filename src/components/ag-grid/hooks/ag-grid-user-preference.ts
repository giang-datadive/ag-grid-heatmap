import {
  AgGridEvent,
  Events,
  GridApi,
  ColDef,
  ColGroupDef,
  GridReadyEvent,
} from "ag-grid-community";
import { useCallback, useMemo, useRef } from "react";
import { useRecoilCallback } from "recoil";
import { sortBy, isNil, omit } from "lodash";
import { GridPreferenceState, GridPreference } from "../types";

export const useGridPreferenceCallbacks = (
  gridPreferenceState?: GridPreferenceState,
  maintainColumnOrder?: boolean,
  customKey?: string
) => {
  const { atom: preferenceAtom, type: gridPreferenceType } =
    gridPreferenceState || {};
  const setPreference = useRecoilCallback(({ set }) => set, []);

  /** Takes AgGridEvent and return grid preferences that needs to be persisted */
  const getGridPreferenceValues = useCallback(
    ({ api, columnApi }: AgGridEvent): GridPreference => {
      return {
        columnsState: columnApi.getColumnState(),
        columnsGroupState: columnApi.getColumnGroupState(),
        filter: api.getFilterModel(),
      };
    },
    []
  );

  /** Takes AgGridEvent and updates the userPreference with the updated grid values */
  const onGridChanged = useCallback(
    (evt: AgGridEvent) => {
      if (preferenceAtom) {
        const updatedUserPreference = getGridPreferenceValues(evt);
      }
    },
    [
      setPreference,
      getGridPreferenceValues,
      preferenceAtom,
      gridPreferenceType,
      customKey,
    ]
  );

  const bindGridChangeEvents = useCallback(
    (api: GridApi) => {
      api.addEventListener(Events.EVENT_SORT_CHANGED, onGridChanged);
      api.addEventListener(Events.EVENT_COLUMN_RESIZED, onGridChanged);
      api.addEventListener(Events.EVENT_COLUMN_VISIBLE, onGridChanged);
      api.addEventListener(Events.EVENT_COLUMN_PINNED, onGridChanged);
      api.addEventListener(Events.EVENT_FILTER_CHANGED, onGridChanged);
      maintainColumnOrder &&
        api.addEventListener(Events.EVENT_COLUMN_MOVED, onGridChanged);
    },
    [maintainColumnOrder, onGridChanged]
  );

  const restoreGridPreference = useCallback(
    (userPreference: GridPreference, api: GridApi) =>
      new Promise<boolean>((resolve) => {
        setTimeout(() => {
          // TODO: Need to revisit this functionality when Enterprise account tag filter integrated
          // We only restore grid filter, while column state will be merged with columnDefs
          if (userPreference?.filter) {
            api.setFilterModel(userPreference.filter);
          }
          resolve(true);
        }, 250);
      }),
    []
  );

  /**
   * This event is called when Ag Grid has initialised and is ready for most api
   * calls, but may not be fully rendered yet. useRecoilCallback is very important here,
   * as we need to access the atom value while making sure not to change the callback
   * function when its value changes.
   */
  const initializeGridPreference = useRecoilCallback(
    ({ snapshot }) =>
      async (e: GridReadyEvent) => {
        const { api } = e;
        if (preferenceAtom) {
          //Get preference value from atom
          const userPreference = await snapshot.getPromise(preferenceAtom);
          //First restore preference
          await restoreGridPreference(userPreference, api);
        }
        //Then bind all the events, to prevent an extra call to update the preference. As restore will call all the change events
        bindGridChangeEvents(api);
      },
    [bindGridChangeEvents, preferenceAtom, restoreGridPreference]
  );

  return initializeGridPreference;
};

/**
 * Check if colDef is a definition of Column Group (ColGroupDef)
 */
const isColGroupDef = (value: ColDef | ColGroupDef): value is ColGroupDef => {
  const asColGroupDef = value as ColGroupDef;
  return asColGroupDef.children && asColGroupDef.children.length > 0;
};

/**
 * Find and update (merge) column definition defined in FE with user preferences.
 * User preferences will take higher priority on merge.
 */
const findAndUpdateColDef = (
  colDefs: (ColDef | ColGroupDef)[],
  id: string,
  updater: (foundValue: ColDef | ColGroupDef) => ColDef | ColGroupDef
) => {
  for (let i = 0; i < colDefs.length; i++) {
    const colDef = colDefs[i];
    if (isColGroupDef(colDef)) {
      const colId = colDef.groupId;
      if (colId === id) {
        colDefs[i] = updater(colDef);
        return;
      }
      findAndUpdateColDef(colDef.children, id, updater);
    } else {
      const colId = colDef.colId || colDef.field;
      if (colId === id) {
        colDefs[i] = updater(colDef);
        return;
      }
    }
  }
};

/**
 * Get id of column definition.
 * If it's a column group definition, find and get id of the closest child column definition.
 * Because columns state order is based on column definition order
 */
const getColId = (colDef: ColDef | ColGroupDef): string | undefined => {
  if (isColGroupDef(colDef)) {
    return colDef.children ? getColId(colDef.children[0]) : undefined;
  }
  return colDef.colId || colDef.field;
};

type ColDefWithIndex = (ColDef | ColGroupDef) & {
  defIndex: number;
};
/**
 * Build colDefs index map, non-index colDef will use its closest left sibling index
 */
const buildIndexMap = (
  colDefsWithIndex: ColDefWithIndex[],
  columnsState: GridPreference["columnsState"]
) => {
  const indexMap: Record<number, number> = {};
  let leftSiblingIndex = -1;
  colDefsWithIndex.forEach((colDef) => {
    const orderIndex = columnsState?.findIndex((colState) => {
      return colState.colId === getColId(colDef);
    });
    if (isNil(orderIndex) || orderIndex < 0) {
      indexMap[colDef.defIndex] = leftSiblingIndex;
    } else {
      indexMap[colDef.defIndex] = orderIndex;
      // Memorize closest left sibling index
      leftSiblingIndex = orderIndex;
    }
  });
  return indexMap;
};

/**
 * Sort column definition in ColumnDefs hierarchy based on user preferences columnsState order
 * If order index is not found, use its closest left sibling index to sort
 */
const sortColDef = (
  colDefs: (ColDef | ColGroupDef)[],
  columnsState?: GridPreference["columnsState"]
) => {
  if (columnsState) {
    if (colDefs?.length > 1) {
      let colDefsWithIndex: ColDefWithIndex[] = colDefs.map((colDef, index) => {
        return {
          ...colDef,
          defIndex: index,
        };
      });
      const indexMap = buildIndexMap(colDefsWithIndex, columnsState);
      // Sort column defs by index defined in index map
      colDefsWithIndex = sortBy(colDefsWithIndex, (colDef) => {
        return indexMap[colDef.defIndex];
      });

      // Remove custom attribute `defIndex` from colDef
      colDefs = colDefsWithIndex.map((colDef) => omit(colDef, ["defIndex"]));
    }
    for (let i = 0; i < colDefs.length; i++) {
      const colDef = colDefs[i];
      if (isColGroupDef(colDef)) {
        colDef.children = sortColDef(colDef.children, columnsState);
      }
    }
  }
  return colDefs;
};

/**
 * This hook is used to merge Ag-grid column definition from FE defined and user preference from BE and keep it synced
 */
export const usePersistentGridColumnDefs = (
  colDefs: (ColDef | ColGroupDef)[] | null | undefined,
  gridPreferenceState?: GridPreferenceState,
  maintainColumnOrder?: boolean
) => {
  const memorizedColDefs = useRef<(ColDef | ColGroupDef)[]>(colDefs || []);
  const needMergeWithPreference = useRef(true);
  /**
   * use useRecoilCallback hook here to just initially merge columnDefs only ONCE
   * instead of put grid preference RecoilState as useMemo's dependency
   */
  const getUserPreference = useRecoilCallback(
    ({ snapshot }) =>
      (atom: GridPreferenceState["atom"]) => {
        return snapshot.getLoadable(atom).valueMaybe();
      },
    []
  );
  return useMemo(() => {
    if (!colDefs || colDefs.length === 0) {
      return [];
    }
    if (gridPreferenceState) {
      const { atom: preferenceAtom } = gridPreferenceState;
      const userPreference = getUserPreference(preferenceAtom);
      if (userPreference) {
        // Update and merge column definition
        userPreference.columnsState?.forEach((colState) => {
          findAndUpdateColDef(colDefs, colState.colId, (colDef: ColDef) => {
            if (needMergeWithPreference.current) {
              return {
                ...colDef,
                ...colState,
                ...(getColId(colDef) === "select"
                  ? {
                      pinned: colDef.pinned,
                      hide: colDef.hide,
                    }
                  : {}),
              } as ColDef;
            }
            return {
              ...colDef,
              ...colState,
              // Keep track of latest hide, sort state after merge colDef with preference
              hide: colDef.hide,
              sort: colDef.sort,
              sortIndex: colDef.sortIndex,
            } as ColDef;
          });
        });
        // Update and merge column group definition
        userPreference.columnsGroupState?.forEach((colGroupState) => {
          findAndUpdateColDef(
            colDefs,
            colGroupState.groupId,
            (colGroupDef) =>
              ({
                ...colGroupDef,
                openByDefault: colGroupState.open,
              } as ColGroupDef)
          );
        });
        const sortedColDefs = maintainColumnOrder
          ? // Sort column / column group definition based on columnsState order
            sortColDef(colDefs, userPreference.columnsState)
          : colDefs;
        needMergeWithPreference.current = false;
        memorizedColDefs.current = sortedColDefs;
        return sortedColDefs;
      }
      return memorizedColDefs.current;
    }
    return colDefs;
  }, [colDefs, getUserPreference, gridPreferenceState, maintainColumnOrder]);
};
