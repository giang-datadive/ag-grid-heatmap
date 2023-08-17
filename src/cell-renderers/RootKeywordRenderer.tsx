import React from "react";
import { ICellRendererParams } from "ag-grid-community";
import KeywordRenderer from "../cell-renderers/KeywordRenderer";
import { useRecoilState, useRecoilValue } from "recoil";
import { isRootModeState, rootExpandedState } from "../atoms/rank-radar";
import { HeatmapRow } from "../types/rank-radar";
import classNames from "classnames";

const RootKeywordRenderer = (props: ICellRendererParams) => {
  const { node, data } = props;
  const { keyword, id, keywords } = data as HeatmapRow;
  const isRootMode = useRecoilValue(isRootModeState);
  const [isExpanded, setIsExpanded] = useRecoilState(rootExpandedState(id));

  const handleCollapse = () => {
    setIsExpanded(false);
    node.setExpanded(false);
  };

  if (node.level === 0 && isRootMode) {
    return (
      <div
        className={classNames(
          "flex items-center w-full overflow-hidden relative",
          isExpanded ? "gap-2" : "gap-4"
        )}
      >
        <div className={classNames("shrink-0", isExpanded && "font-bold")}>
          {keyword}
        </div>

        {isExpanded ? (
          <div
            onClick={handleCollapse}
            className="uppercase text-[11px] leading-[8px] text-primary font-medium py-1 px-1.5 border border-primary rounded cursor-pointer"
          >
            Collapse
          </div>
        ) : (
          <div className="flex items-center text-secondary-4">
            {keywords?.map((kw) => kw.keyword).join(",")}
          </div>
        )}
      </div>
    );
  }

  return <KeywordRenderer {...props} />;
};

export default RootKeywordRenderer;
