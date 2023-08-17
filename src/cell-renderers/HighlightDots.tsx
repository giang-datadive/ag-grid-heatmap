import React from "react";
import { Highlight } from "../types/rank-radar";
import { Tooltip } from "antd";

const MAX_DISPLAYED_HIGHLIGHT = 3;

interface HighlightDotsProps {
  highlights: Highlight[];
}

const HighlightDots = ({ highlights }: HighlightDotsProps) => {
  const showedHls = highlights.slice(0, MAX_DISPLAYED_HIGHLIGHT);
  const restHls = highlights.slice(MAX_DISPLAYED_HIGHLIGHT);

  return (
    <div className="flex items-center">
      {showedHls.map((highlight, index) => (
        <Tooltip title={highlight.title} key={highlight.id}>
          <div
            className="w-4 h-4 border-[5px] rounded-full border-solid bg-white"
            style={{
              borderColor: highlight.color,
              transform: `translateX(-${index * 7}px)`,
            }}
          />
        </Tooltip>
      ))}

      {restHls.length > 0 && (
        <Tooltip title={restHls.map((item) => item.title).join(", ")}>
          <span className="text-[11px] font-medium leading-[8px] text-secondary-4 -ml-[12px]">
            +{restHls.length}
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export default HighlightDots;
