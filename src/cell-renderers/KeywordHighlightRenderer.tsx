import React, { useEffect } from "react";
import { ICellRendererParams } from "ag-grid-community";
import { useRecoilValue } from "recoil";
import {
  highlightSelector,
  selectedRowMapSelector,
} from "../selectors/rank-radar";
import { usePrevious } from "react-use";
import HighlightDots from "./HighlightDots";

const KeywordHighlightRenderer = ({ data, node }: ICellRendererParams) => {
  const selectedRowMap = useRecoilValue(selectedRowMapSelector);
  const highlights = useRecoilValue(highlightSelector(data.id));
  const prevSelected = usePrevious(selectedRowMap[data.id]);

  useEffect(() => {
    if (prevSelected !== selectedRowMap[data.id]) {
      node.setSelected(selectedRowMap[data.id]);
    }
  }, [selectedRowMap, data, node, prevSelected]);

  if (data.isAggregateRow) return null;

  if (!highlights.length) {
    return (
      <div className="w-4 h-4 bg-white border-[2px] border-solid border-[#C9CFD7] rounded-full" />
    );
  }

  return <HighlightDots highlights={highlights} />;
};

export default KeywordHighlightRenderer;
