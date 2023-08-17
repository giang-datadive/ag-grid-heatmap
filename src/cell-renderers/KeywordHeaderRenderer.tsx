import React from "react";
import { useRecoilValue } from "recoil";
import { heatmapRowsSelector, rootRowsSelector } from "../selectors/rank-radar";
import { isRootModeState } from "../atoms/rank-radar";

const KeywordHeaderRenderer = () => {
  const keywords = useRecoilValue(heatmapRowsSelector);
  const isRootMode = useRecoilValue(isRootModeState);
  const rootRows = useRecoilValue(rootRowsSelector);

  return (
    <div className="text-[14px] flex gap-1">
      <span className="text-black">
        {isRootMode ? "Normalized Roots" : "KWs"}
      </span>
      <span className="font-normal">
        ({isRootMode ? rootRows.length : keywords.length})
      </span>
    </div>
  );
};

export default KeywordHeaderRenderer;
