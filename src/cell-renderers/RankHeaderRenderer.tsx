import React from "react";
import classNames from "classnames";
import { IHeaderParams } from "ag-grid-community";
import { useRecoilState } from "recoil";
import { formatDate, getDateFromString } from "../utils";
import { useMarketPlaceTimeZone, useSetSelectedDate } from "../hooks";
import { hoveredColumnState } from "../atoms/rank-radar";
import RankHeaderIndicator from "../components/RankHeaderIndicator";

interface DateHeaderRendererProps extends IHeaderParams {
  field: string;
  index: number;
  enabledColHover?: boolean;
}

const RankHeaderRenderer = ({
  field,
  index,
  enabledColHover = true,
}: DateHeaderRendererProps) => {
  const timeZone = useMarketPlaceTimeZone();
  const parsedDate = getDateFromString(field, timeZone);
  const setSelectedDate = useSetSelectedDate();
  const [hoveredColumn, setHoveredColumn] = useRecoilState(hoveredColumnState);

  if (!parsedDate) return null;

  return (
    <>
      <RankHeaderIndicator date={field} />
      <div
        className={classNames(
          "flex flex-col justify-center items-center",
          "text-[12px] font-medium h-full relative",
          "p-1 cursor-pointer",
          index === 14 ? "w-[36px]" : "w-[38px]"
        )}
        onClick={() => setSelectedDate(field)}
        onMouseEnter={() => enabledColHover && setHoveredColumn(field)}
      >
        <div className="flex py-2 flex-col flex-1 items-center justify-center z-[9] leading-[8px] gap-2 uppercase font-medium">
          <div
            className={classNames("text-[11px] flex-1 flex items-center", {
              "text-secondary-7":
                parsedDate.getDay() === 6 || parsedDate.getDay() === 0,
            })}
          >
            {formatDate(parsedDate, "ccc", "N/A", timeZone)}
          </div>
          <div className="text-center text-black text-[13px] flex-1 flex items-center">
            {parsedDate.getDate()}
          </div>

          <div className="text-[11px] flex-1 flex items-center">
            {formatDate(parsedDate, "MMM", "N/A", timeZone)}
          </div>
        </div>
        {enabledColHover && hoveredColumn === field && (
          <div className="bg-[#eff5fe] absolute h-full -left-[1px] w-[38px]" />
        )}
      </div>
    </>
  );
};

export default RankHeaderRenderer;
