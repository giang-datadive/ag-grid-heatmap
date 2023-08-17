import classNames from "classnames"
import { debounce } from "lodash"
import React, { useState, cloneElement, useRef } from "react"
import { IHeaderParams, Events } from "ag-grid-community"
import { useEffectOnce } from "react-use"

export interface ICustomHeaderParams extends IHeaderParams {
  // A react element to be customized inside ag-grid header
  content: JSX.Element
  RightContent?: ((props?: ICustomHeaderParams) => JSX.Element) | JSX.Element
  // Force custom component stop event propagation to the parent element
  suppressPropagation?: boolean
  reversed?: boolean
  align?: "left" | "right" | "center"
  className?: string
}

type SortState = "asc" | "desc" | null
const AgHeaderRenderer = (props: ICustomHeaderParams) => {
  // We need to pass all the HeaderParams props to custom component
  const {
    content,
    RightContent,
    suppressPropagation,
    reversed,
    align,
    column,
    progressSort,
    displayName,
    enableSorting,
    enableMenu,
    className,
    api,
    columnApi,
  } = props
  const [sortState, setSortState] = useState<SortState>()
  const [filterActive, setFilterActive] = useState(false)
  const menuBtnRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffectOnce(() => {
    const onSortChanged = debounce(() => {
      setSortState(column.getSort())
    }, 25)
    const onFilterChange = debounce(() => {
      setFilterActive(column.isFilterActive())
    }, 25)

    // Sync sort/filter state that is determined after component mounted to make sure our state up-to-date
    onSortChanged()
    onFilterChange()
    column.addEventListener(Events.EVENT_SORT_CHANGED, onSortChanged)
    column.addEventListener(Events.EVENT_FILTER_CHANGED, onFilterChange)
    return () => {
      column.removeEventListener(Events.EVENT_SORT_CHANGED, onSortChanged)
      column.removeEventListener(Events.EVENT_FILTER_CHANGED, onFilterChange)
    }
  })

  const isContentDomType = typeof content?.type === "string"
  return (
    <div
      className={classNames(
        "flex items-center w-full h-full ag-header-renderer-container",
        align === "center"
          ? "justify-center"
          : align === "right"
          ? "justify-end"
          : "justify-start",
        reversed && "flex-row-reverse",
        enableSorting && "cursor-pointer",
        className
      )}
      onClick={(evt: React.MouseEvent) => {
        if (!enableSorting) return
        progressSort(evt.shiftKey)
      }}
      onMouseEnter={() => {
        if (!enableMenu) return
        setShowMenu(true)
      }}
      onMouseLeave={() => {
        if (!enableMenu) return
        setShowMenu(false)
      }}
    >
      <div>
        {content
          ? /**
             * Give custom component access to all props of HeaderParams and extends the onClick function
             */
            cloneElement(content, {
              onClick: (evt: React.MouseEvent) => {
                /**
                 * Event stop propagation is controlled by suppressPropagation props
                 * and it's enabled by default if custom component has its own onClick function
                 */
                const isStopPropagation =
                  content.props.onClick || suppressPropagation
                if (isStopPropagation) evt.stopPropagation()
                content.props.onClick && content.props.onClick(evt)
              },
              ...(isContentDomType
                ? {}
                : {
                    api,
                    columnApi,
                  }),
            })
          : displayName}
      </div>
      {(filterActive || enableSorting) && (
        <div className="ml-1.5 flex items-center gap-0.5">
          {filterActive && (
            <div>
              <span
                className="ag-icon ag-icon-filter select-none"
                role="presentation"
              ></span>
            </div>
          )}
          {enableSorting && (
            <div>
              <span
                className={classNames("select-none ag-icon", {
                  "ag-icon-none": !sortState,
                  "ag-icon-asc": sortState === "asc",
                  "ag-icon-desc": sortState === "desc",
                })}
                role="presentation"
              ></span>
            </div>
          )}
        </div>
      )}
      {typeof RightContent === "function" ? (
        <RightContent {...props} />
      ) : (
        RightContent
      )}
      {enableMenu && (
        <div className="flex-1 ml-1 flex items-center justify-end">
          <div
            ref={menuBtnRef}
            className={classNames({
              "opacity-0": !showMenu,
            })}
            onClick={(evt) => {
              evt.stopPropagation()
              menuBtnRef.current && props.showColumnMenu(menuBtnRef.current)
            }}
          >
            <span className={`ag-icon ag-icon-menu`}></span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgHeaderRenderer
