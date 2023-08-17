import classNames from "classnames";
import React, { useMemo } from "react";
import { Highlight } from "../types/rank-radar";
import { Tooltip } from "antd";

interface KeywordHighlightsProps {
  highlights: Highlight[];
}

const KeywordHighlights = ({ highlights }: KeywordHighlightsProps) => {
  if (!highlights.length) return null;
  const [firstHl, ...rest] = highlights;

  return (
    <div className="flex gap-2 items-center">
      <Tooltip title={firstHl.title}>
        <div
          className={classNames(
            "inline-block text-[11px] border border-solid rounded",
            "leading-[8px] py-1 px-1.5 font-medium uppercase",
            "text-white bg-secondary-4 border-secondary-4 relative overflow-hidden"
          )}
          style={{
            backgroundColor: firstHl.color,
            borderColor: firstHl.color,
            maxWidth: 70,
          }}
        >
          {firstHl.title}
        </div>
      </Tooltip>

      {rest.length > 0 && (
        <Tooltip title={rest.map((item) => item.title).join(", ")}>
          <span className="text-[11px] font-medium leading-[8px] text-secondary-4">
            +{rest.length}
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export default KeywordHighlights;
