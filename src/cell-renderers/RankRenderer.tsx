import React from "react"
import { ICellRendererParams } from "ag-grid-community"
import SingleRankRenderer from "./SingleRankRenderer"
import { useRecoilState, useRecoilValue } from "recoil"
import { heatmapRankTypeState, hoveredColumnState } from "@/atoms/rank-radar"
import { useIsShowDualRank } from "../hooks"
import classNames from "classnames"

interface RankRendererProps extends ICellRendererParams {
  colIndex: number
}

const RankRenderer = (props: RankRendererProps) => {
  const { data, column, colIndex, node } = props
  const field = column?.getColId() || ""
  const rankType = useRecoilValue(heatmapRankTypeState)
  const isDualRender = useIsShowDualRank()
  const organicRank = data.organicRankData[field]
  const impressionRank = data.impressionRankData[field]
  const interpolatedData = data.interpolatedData?.[field]
  const rankValue = rankType === "organic" ? organicRank : impressionRank
  const [hoveredColumn, setHoveredColumn] = useRecoilState(hoveredColumnState)

  if (isDualRender) {
    return (
      <>
        {colIndex === 0 && (
          <div
            className={classNames(
              "absolute flex flex-col left-0 org-vs-ir-text items-end",
              "text-[12px] font-medium gap-2 text-[#A0AAB8]",
              !data.isAggregateRow && "hidden"
            )}
          >
            <span>Org</span>
            <span>IR</span>
          </div>
        )}
        <div
          className="flex flex-col gap-[2px] h-full justify-center z-[2]"
          onMouseEnter={() => setHoveredColumn(field)}
        >
          <SingleRankRenderer
            {...props}
            ignoreBottomBorder
            rankValue={organicRank}
            interpolatedData={interpolatedData}
          />
          <SingleRankRenderer
            {...props}
            ignoreTopBorder
            haveVerticalExtraBorder
            rankValue={impressionRank}
          />
        </div>

        <div
          className={classNames(
            "absolute w-[38px] h-full z-1",
            data.isAggregateRow && "border-y",
            hoveredColumn === field && "bg-[#eff5fe] border-y-primary",
            colIndex === 0 ? "-right-[1px]" : "-left-[1px]"
          )}
        />
      </>
    )
  }

  return (
    <div
      onMouseEnter={() => setHoveredColumn(field)}
      className={classNames(
        "h-full flex",
        node.rowIndex === 0 && !data.isAggregateRow
          ? "items-end"
          : "items-center"
      )}
    >
      <div
        className={classNames(
          interpolatedData && !interpolatedData?.hidden ? "z-10" : "z-[2]"
        )}
      >
        <SingleRankRenderer
          {...props}
          rankValue={rankValue}
          interpolatedData={
            rankType === "organic" ? interpolatedData : undefined
          }
        />
      </div>

      <div
        className={classNames(
          "absolute w-[38px] h-full z-1",
          data.isAggregateRow && "border-y",
          hoveredColumn === field && "bg-[#eff5fe] border-y-primary",
          colIndex === 0 ? "-right-[1px]" : "-left-[1px]"
        )}
      />
    </div>
  )
}

export default React.memo(RankRenderer)
