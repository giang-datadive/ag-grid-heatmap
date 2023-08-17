import React from "react";
import { ICellRendererParams } from "ag-grid-community";
import classNames from "classnames";
import { useRecoilValue } from "recoil";
import { isRootModeState, rootExpandedState } from "@/atoms/rank-radar";

const ValueRenderer = ({
  data,
  valueFormatted,
  value,
}: ICellRendererParams) => {
  const isRootMode = useRecoilValue(isRootModeState);
  const isRootExpanded = useRecoilValue(rootExpandedState(data.id));

  return (
    <span className={classNames(isRootMode && isRootExpanded && "font-bold")}>
      {valueFormatted || value}
    </span>
  );
};

export default ValueRenderer;
