import { useCallback, useEffect } from "react"

const useAgGridScrollableHeaders = (
  tableSelector: string | null,
  isDisabled = false
) => {
  const onHeaderScroll = useCallback(
    (ev: WheelEvent) => {
      if (!tableSelector) return

      ev.preventDefault()

      const grid = document.querySelector(tableSelector)

      const gridViewport = grid?.querySelector(".ag-body-viewport") as
        | HTMLDivElement
        | undefined

      const centerColsViewport = grid?.querySelector(
        ".ag-center-cols-viewport"
      ) as HTMLDivElement | undefined

      const agHorizontalScrollViewport = grid?.querySelector(
        ".ag-body-horizontal-scroll-viewport"
      ) as HTMLDivElement | undefined

      if (!gridViewport || !agHorizontalScrollViewport) return

      const isHorizontalScroll =
        Math.abs(ev.deltaX) > Math.abs(ev.deltaY) || ev.shiftKey

      if (isHorizontalScroll) {
        const elementToScroll =
          (centerColsViewport?.scrollWidth || 0) >
          agHorizontalScrollViewport.scrollWidth
            ? centerColsViewport
            : agHorizontalScrollViewport

        elementToScroll?.scrollBy(ev.shiftKey ? ev.deltaY : ev.deltaX, 0)
      } else gridViewport.scrollBy(0, ev.deltaY)
    },
    [tableSelector]
  )

  useEffect(() => {
    if (isDisabled || !tableSelector) return

    const gridHeader = document
      .querySelector(tableSelector)
      ?.querySelector(".ag-header") as HTMLDivElement | undefined

    if (!gridHeader) return

    gridHeader.addEventListener("wheel", onHeaderScroll)

    return () => gridHeader.removeEventListener("wheel", onHeaderScroll)
  }, [isDisabled, onHeaderScroll, tableSelector])
}

export default useAgGridScrollableHeaders
