import React from "react";
import { ICellRendererParams } from "ag-grid-community";
import { useRecoilValue } from "recoil";
import { isRootModeState, rootExpandedState } from "@/atoms/rank-radar";
import classNames from "classnames";

const PpcRankRenderer = ({ value, data }: ICellRendererParams) => {
  const isRootMode = useRecoilValue(isRootModeState);
  const isRootExpanded = useRecoilValue(rootExpandedState(data.id));

  if (!value) {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={classNames(
          "bg-primary-1 min-w-[16px] h-[16px] text-[12px] rounded-[3px] text-black flex items-center justify-center",
          isRootMode && isRootExpanded && "font-bold"
        )}
      >
        {value}
      </div>
    </div>
  );
};

export default PpcRankRenderer;
