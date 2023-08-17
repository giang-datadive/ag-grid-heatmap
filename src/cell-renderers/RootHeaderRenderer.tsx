import classNames from "classnames"
import React from "react"

const RootHeaderRenderer = () => {
  return (
    <div
      className={classNames(
        "ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ml-7"
      )}
    >
      <input
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        className="ag-input-field-input ag-checkbox-input"
        type="checkbox"
        aria-label="Press Space to toggle row selection (unchecked)"
      />
    </div>
  )
}

export default RootHeaderRenderer
