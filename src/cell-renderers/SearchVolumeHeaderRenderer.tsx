import { PlusOutlined } from "@ant-design/icons";
import React, { MouseEvent } from "react";
import { useRecoilState } from "recoil";
import { heatmapIsExpandedState } from "@/atoms/rank-radar";
import classNames from "classnames";
import { useIsShowDualRank } from "../hooks";

const SearchVolumeHeaderRenderer = () => {
  const [isExpanded, setIsExpanded] = useRecoilState(heatmapIsExpandedState);
  const isShowDualRank = useIsShowDualRank();

  const handleExpand = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(true);
  };

  return (
    <div className="flex flex-col items-end">
      <span className="text-black text-[14px]">Search Volume</span>

      {!isExpanded && (
        <div
          onClick={handleExpand}
          className={classNames(
            "rounded-[3px] w-4 h-4 bg-primary flex items-center justify-center",
            "absolute cursor-pointer top-[-6px]",
            isShowDualRank ? "-right-[22px]" : "-right-[7px]"
          )}
        >
          <PlusOutlined className="text-[8px] text-white" />
        </div>
      )}
    </div>
  );
};

export default SearchVolumeHeaderRenderer;
