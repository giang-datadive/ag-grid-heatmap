import React from "react"
import { useRecoilValue } from "recoil"
import { isNatualTimelineSelector } from "../selectors/rank-radar"
import { HeatmapRow, InterpolatedData } from "../types/rank-radar"
import { Tooltip } from "antd"
import classNames from "classnames"
import { getCellRankColor } from "../utils"
import { isRootModeState, rootExpandedState } from "../atoms/rank-radar"
import GapFillingDate from "./GapFillingDate"

interface GapFillingProps {
  data: HeatmapRow
  interpolatedData: InterpolatedData
  shouldNotRoundedLeft: boolean
  shouldNotRoundedRight: boolean
  shouldNotRoundedBottom: boolean
  shouldNotRoundedTop: boolean
  ignoreBottomBorder?: boolean
  ignoreTopBorder?: boolean
}

const CELL_WIDTH = 36
const BORDER_WIDTH = 2

const GapFilling = ({
  data,
  interpolatedData,
  shouldNotRoundedLeft,
  shouldNotRoundedRight,
  shouldNotRoundedBottom,
  shouldNotRoundedTop,
  ignoreBottomBorder,
  ignoreTopBorder,
}: GapFillingProps) => {
  const isRootMode = useRecoilValue(isRootModeState)
  const isRootExpanded = useRecoilValue(rootExpandedState(data.id))
  const isNaturalTimeline = useRecoilValue(isNatualTimelineSelector)

  const {
    startValue,
    endValue,
    cellCount,
    hidden,
    startDateText,
    endDateText,
    dates,
  } = interpolatedData

  if (hidden) {
    return <div />
  }

  const getWidth = () => cellCount * CELL_WIDTH + (cellCount - 1) * BORDER_WIDTH

  const getDateRangeText = () => {
    if (startDateText === endDateText) {
      return `on ${startDateText}`
    }

    if (isNaturalTimeline) {
      return `from ${startDateText} to ${endDateText}`
    }

    return `from ${endDateText} to ${startDateText}`
  }

  const tooltipText = (
    <div className="flex flex-col gap-2">
      <p>
        Ranks for <span className="text-secondary-7">{data.keyword}</span> are
        missing {getDateRangeText()}.
      </p>
      <p className="italic">
        We fill gaps with 3 days or less with average ranks
      </p>
    </div>
  )

  return (
    <Tooltip
      overlayStyle={{ maxWidth: 400 }}
      mouseEnterDelay={0.6}
      title={tooltipText}
      arrow={false}
    >
      <div
        className={classNames(
          "h-full w-full bg-blue-500 absolute rounded-[3px] flex items-center",
          isNaturalTimeline ? "left-0" : "right-0",
          shouldNotRoundedLeft && "rounded-l-none",
          shouldNotRoundedRight && "rounded-r-none",
          shouldNotRoundedBottom && "rounded-b-none",
          shouldNotRoundedTop && "rounded-t-none",
          isRootExpanded && isRootMode && "font-bold",
          isNaturalTimeline ? "" : "flex-row-reverse"
        )}
        style={{
          width: getWidth(),
          background: `linear-gradient(90deg, ${getCellRankColor(
            isNaturalTimeline ? startValue : endValue
          )} 0%, ${getCellRankColor(
            isNaturalTimeline ? endValue : startValue
          )} 100%)`,
        }}
      >
        {dates.map((date) => (
          <GapFillingDate
            ignoreBottomBorder={ignoreBottomBorder}
            ignoreTopBorder={ignoreTopBorder}
            key={date}
            date={date}
            kwId={data.id}
          />
        ))}
      </div>
    </Tooltip>
  )
}

export default GapFilling
