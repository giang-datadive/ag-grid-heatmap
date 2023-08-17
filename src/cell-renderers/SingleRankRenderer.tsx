import React, { useMemo } from "react";
import { ICellRendererParams } from "ag-grid-community";
import { getCellRankColor } from "@/utils";
import classNames from "classnames";
import { useRecoilValue } from "recoil";
import {
  cellBorderSelector,
  isNatualTimelineSelector,
} from "@/selectors/rank-radar";
import {
  datesState,
  isRootModeState,
  rootExpandedState,
} from "@/atoms/rank-radar";
import { MAX_DISPLAYED_RANK } from "@/constants";
import { Tooltip } from "antd";
import { InterpolatedData } from "@/types/rank-radar";
import GapFilling from "./GapFilling";

interface RankRendererProps extends ICellRendererParams {
  hasSeparator?: boolean;
  ignoreBottomBorder?: boolean;
  ignoreTopBorder?: boolean;
  haveVerticalExtraBorder?: boolean;
  rankValue: number;
  interpolatedData?: InterpolatedData;
}

const SingleRankRenderer = ({
  data,
  column,
  ignoreBottomBorder,
  ignoreTopBorder,
  haveVerticalExtraBorder,
  rankValue,
  interpolatedData,
}: RankRendererProps) => {
  const field = column?.getColId() || "";
  const isNaturalTimeline = useRecoilValue(isNatualTimelineSelector);
  const dates = useRecoilValue(datesState);
  const borders = useRecoilValue(cellBorderSelector(`${data.id}_${field}`));
  const isRootMode = useRecoilValue(isRootModeState);
  const isRootExpanded = useRecoilValue(rootExpandedState(data.id));

  const borderStyles = useMemo(() => {
    const styles: Record<string, string> = {};
    if (borders.top && !ignoreTopBorder) {
      styles.borderTop = `2px solid ${borders.top}`;
    }
    if (borders.bottom && !ignoreBottomBorder) {
      styles.borderBottom = `2px solid ${borders.bottom}`;
    }
    if (borders.left) {
      styles.borderLeft = `2px solid ${borders.left}`;
    }
    if (borders.right) {
      styles.borderRight = `2px solid ${borders.right}`;
    }

    return styles;
  }, [borders, ignoreTopBorder, ignoreBottomBorder]);

  const isLastDay = isNaturalTimeline
    ? field === dates[dates.length - 1]
    : field === dates[0];

  const isFirstDay = isNaturalTimeline
    ? field === dates[0]
    : field === dates[dates.length - 1];

  const hasExtraTopRightBorder =
    borders.top && !borders.right && !isLastDay && !ignoreTopBorder;
  const hasExtraBottomRightBorder =
    borders.bottom && !borders.right && !isLastDay && !ignoreBottomBorder;
  const hasExtraTopLeftBorder =
    borders.top && !borders.left && !ignoreTopBorder && !isFirstDay;
  const hasExtraBottomLeftBorder =
    borders.bottom && !borders.left && !ignoreBottomBorder && !isFirstDay;
  const hasExtraLeftBorder = haveVerticalExtraBorder && borders.left;
  const hasExtraRightBorder = haveVerticalExtraBorder && borders.right;

  const shouldNotRoundedLeft = borders.top && !borders.left;
  const shouldNotRoundedRight = borders.top && !borders.right;
  const shouldNotRoundedBottom =
    (ignoreBottomBorder && borders.left) ||
    (ignoreBottomBorder && borders.right);
  const shouldNotRoundedTop =
    (ignoreTopBorder && borders.left) || (ignoreTopBorder && borders.right);

  if (interpolatedData) {
    return (
      <div
        className="relative"
        style={{
          width: 36,
          height: 28,
          borderRadius: 3,
        }}
      >
        <GapFilling
          ignoreBottomBorder={ignoreBottomBorder}
          ignoreTopBorder={ignoreTopBorder}
          shouldNotRoundedLeft={!!shouldNotRoundedLeft}
          shouldNotRoundedRight={!!shouldNotRoundedRight}
          shouldNotRoundedBottom={!!shouldNotRoundedBottom}
          shouldNotRoundedTop={!!shouldNotRoundedTop}
          data={data}
          interpolatedData={interpolatedData}
        />
      </div>
    );
  }

  const renderValue = () => {
    if (rankValue > MAX_DISPLAYED_RANK) {
      return `${MAX_DISPLAYED_RANK + 1}+`;
    }

    if (rankValue <= MAX_DISPLAYED_RANK && rankValue > 0) {
      return rankValue;
    }

    return (
      <Tooltip
        arrow={false}
        mouseEnterDelay={0.6}
        title={rankValue ? "" : "There is no rank data available for this day"}
      >
        <div className="h-full w-full" />
      </Tooltip>
    );
  };

  return (
    <div
      className={classNames(
        "w-[36px] h-[28px] rounded-[3px] relative",
        "flex items-center justify-center text-[12px] leading-4",
        shouldNotRoundedLeft && "rounded-l-none",
        shouldNotRoundedRight && "rounded-r-none",
        shouldNotRoundedBottom && "rounded-b-none",
        shouldNotRoundedTop && "rounded-t-none",
        isRootExpanded && isRootMode && "font-bold"
      )}
      style={{
        backgroundColor: getCellRankColor(rankValue),
        ...borderStyles,
      }}
    >
      {renderValue()}

      {hasExtraTopRightBorder && (
        <div
          className="w-[20px] h-[2px] absolute top-[-2px] right-[-15px]"
          style={{ backgroundColor: borders.top }}
        />
      )}

      {hasExtraBottomRightBorder && (
        <div
          className="w-[20px] h-[2px] absolute bottom-[-2px] right-[-15px]"
          style={{ backgroundColor: borders.bottom }}
        />
      )}

      {hasExtraTopLeftBorder && (
        <div
          className="w-[20px] h-[2px] absolute top-[-2px] left-[-15px] z-[-1]"
          style={{ backgroundColor: borders.top }}
        />
      )}

      {hasExtraBottomLeftBorder && (
        <div
          className="w-[20px] h-[2px] absolute bottom-[-2px] left-[-15px] z-[-1]"
          style={{ backgroundColor: borders.bottom }}
        />
      )}

      {hasExtraLeftBorder && (
        <div
          className="w-[2px] h-[8px] absolute"
          style={{
            backgroundColor: borders.left,
            left: -2,
            top: -4,
          }}
        />
      )}

      {hasExtraRightBorder && (
        <div
          className="w-[2px] h-[8px] absolute"
          style={{
            backgroundColor: borders.right,
            right: -2,
            top: -4,
          }}
        />
      )}
    </div>
  );
};

export default React.memo(SingleRankRenderer);
