import React, { MouseEvent } from "react";
import { MinusOutlined } from "@ant-design/icons";
import { useRecoilState } from "recoil";
import { heatmapIsExpandedState } from "../atoms/rank-radar";

const CollapsedButton = () => {
  const [isExpanded, setIsExpanded] = useRecoilState(heatmapIsExpandedState);

  const handleCollapse = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(false);
  };

  return isExpanded ? (
    <div
      onClick={handleCollapse}
      className="rounded-[3px] w-4 h-4 bg-primary flex items-center justify-center absolute cursor-pointer top-[-8px] right-[-1px]"
    >
      <MinusOutlined className="text-[8px] text-white" />
    </div>
  ) : null;
};

export default CollapsedButton;
