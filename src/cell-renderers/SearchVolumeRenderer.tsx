import { ICellRendererParams } from "ag-grid-community"
import { useRecoilValue } from "recoil"
import { isRootModeState, rootExpandedState } from "@/atoms/rank-radar"
import classNames from "classnames"

const SearchVolumeRenderer = ({
  valueFormatted,
  value,
  data,
}: ICellRendererParams) => {
  const isRootMode = useRecoilValue(isRootModeState)
  const isRootExpanded = useRecoilValue(rootExpandedState(data.id))

  return (
    <div className="relative">
      <span
        className={classNames(
          isRootMode && isRootExpanded ? "font-bold" : "font-medium"
        )}
      >
        {valueFormatted || value}
      </span>
      {data.isAggregateRow && (
        <>
          <div className="absolute top-[-2px] right-0 w-[20px] h-[1px] bg-white" />
          <div className="absolute bottom-[-2px] right-0 w-[20px] h-[1px] bg-white" />
        </>
      )}
    </div>
  )
}

export default SearchVolumeRenderer
