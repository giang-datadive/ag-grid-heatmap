import { GridApi } from "ag-grid-community"
import { useEffect } from "react"

export const useCloseToolPanelOnClickAway = (gridApi: GridApi) => {
  useEffect(() => {
    if (!gridApi) return
    const handleClick = (e: MouseEvent) => {
      if (
        !(
          e.composedPath() &&
          (e.composedPath() as HTMLElement[]).some(
            (elem) =>
              elem?.classList?.contains("ag-side-button-button") ||
              elem?.classList?.contains("ag-side-bar")
          )
        )
      )
        gridApi.closeToolPanel()
    }

    document.addEventListener("click", handleClick)

    return () => document.removeEventListener("click", handleClick)
  }, [gridApi])
}
