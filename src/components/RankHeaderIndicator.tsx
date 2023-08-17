import React, { useMemo, useRef } from "react";
import { useRecoilValue } from "recoil";
import { indicatorsDateSelector } from "../selectors/rank-radar";
import { Tooltip } from "antd";
import { useSetSelectedDate } from "../hooks";

interface RankHeaderIndicatorProps {
  date: string;
}

const RankHeaderIndicator = ({ date }: RankHeaderIndicatorProps) => {
  const dateIndicator = useRecoilValue(indicatorsDateSelector({ date }));
  const setSelectedDate = useSetSelectedDate();
  const containerRef = useRef(null);

  const indicators = useMemo(() => {
    if (!dateIndicator) return [];
    const result: { color: string; tooltip: string }[] = [];
    if (dateIndicator.blue) {
      result.push({
        color: "#3774C7",
        tooltip:
          "There is a note left on this day, probably by you or team member.",
      });
    }
    if (dateIndicator.orange) {
      result.push({
        color: "#EF9E53",
        tooltip: `The product has a "New Release" or "Best Seller" badge on that day.`,
      });
    }
    if (dateIndicator.green) {
      result.push({
        color: "#208E3E",
        tooltip: `There is a national holiday occurring, such as Halloween or Independence Day.`,
      });
    }

    return result;
  }, [dateIndicator]);

  return indicators.length > 0 ? (
    <div
      ref={containerRef}
      className="flex items-center justify-center absolute top-[-3px] w-[38px] z-10"
    >
      <div
        className="flex"
        style={{
          width: indicators.length * 8 - (indicators.length - 1) * 3,
        }}
      >
        {indicators.map(({ color, tooltip }, index) => (
          <Tooltip key={color} title={tooltip}>
            <div
              onClick={() => setSelectedDate(date)}
              className="w-[8px] h-[8px] rounded-full shrink-0"
              style={{
                backgroundColor: color,
                transform: `translateX(-${index * 3}px)`,
              }}
            />
          </Tooltip>
        ))}
      </div>
    </div>
  ) : null;
};

export default RankHeaderIndicator;
