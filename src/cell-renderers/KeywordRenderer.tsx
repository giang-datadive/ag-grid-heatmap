import React from "react";
import { ICellRendererParams } from "ag-grid-community";
import { Tooltip } from "antd";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { highlightSelector } from "../selectors/rank-radar";
import {
  isRootModeState,
  selectedHighlightState,
  selectedRowsState,
} from "../atoms/rank-radar";
import classNames from "classnames";
import { useShowHighlightPanel } from "../hooks";
import KeywordHighlights from "@/components/KeywordHighlights";

const KeywordRenderer = ({ value, data, node }: ICellRendererParams) => {
  const { isAggregateRow } = data;
  const highlights = useRecoilValue(highlightSelector(data.id));
  const setSelectedRows = useSetRecoilState(selectedRowsState);
  const setSelectedHighlight = useSetRecoilState(selectedHighlightState);
  const setShowHighlightPanel = useShowHighlightPanel();
  const isRootMode = useRecoilValue(isRootModeState);
  const isChild = node.level === 1;

  if (isAggregateRow) {
    return (
      <div className="flex gap-2 items-center h-full z-10 uppercase text-[12px] font-medium pl-1">
        Aggregate
      </div>
    );
  }

  const handleClick = () => {
    setSelectedHighlight(null);
    setSelectedRows([data]);
    setShowHighlightPanel("summary");
  };

  return (
    <div
      className={classNames(
        "flex items-center gap-1 w-full cursor-pointer",
        isChild && isRootMode && "pl-4"
      )}
      onClick={handleClick}
    >
      <Tooltip title={value}>{value}</Tooltip>

      <KeywordHighlights highlights={highlights} />

      <a
        onClick={(e) => e.stopPropagation()}
        href="#"
        target="_blank"
        rel="noreferrer"
        className="h-[15px] leading-[15px] ml-auto hidden-child"
      >
        l
      </a>
    </div>
  );
};

export default KeywordRenderer;
