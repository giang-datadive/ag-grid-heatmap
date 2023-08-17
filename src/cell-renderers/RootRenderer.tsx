import React, { ChangeEvent, useEffect, useState } from "react";
import { ICellRendererParams } from "ag-grid-community";
import { CaretRightOutlined, UndoOutlined } from "@ant-design/icons";
import classNames from "classnames";
import KeywordHighlightRenderer from "../cell-renderers/KeywordHighlightRenderer";
import { useRecoilState, useRecoilValue } from "recoil";
import { rootExpandedState } from "../atoms/rank-radar";
import { selectedRowMapSelector } from "../selectors/rank-radar";

const RootRenderer = (props: ICellRendererParams) => {
  const { data, node } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isRootExpanded, setIsRootExpanded] = useRecoilState(
    rootExpandedState(props.data.id)
  );
  const selectedRowMap = useRecoilValue(selectedRowMapSelector);

  const isChild = node.level === 1;
  const handleExpand = () => {
    setIsLoading(true);
    setTimeout(() => {
      node.setExpanded(!isRootExpanded);
      setIsRootExpanded(!isRootExpanded);
      setIsLoading(false);
    }, 150);
  };

  useEffect(() => {
    isChild && node.setSelected(isChecked);
  }, [node, isChecked, isChild]);

  useEffect(() => {
    setIsChecked(selectedRowMap[data.id]);
  }, [selectedRowMap, data]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  if (data.isAggregateRow) return null;

  return (
    <div className="flex items-center gap-3">
      {isChild ? (
        <div className="w-7" />
      ) : isLoading ? (
        <UndoOutlined className="animate-spin text-[14px] text-secondary-4" />
      ) : (
        <CaretRightOutlined
          className={classNames(
            "text-secondary-4 cursor-pointer transition-transform",
            isRootExpanded && "rotate-90"
          )}
          onClick={handleExpand}
        />
      )}

      <div
        className={classNames(
          "ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper",
          isChecked && "ag-checked"
        )}
      >
        <input
          checked={isChecked}
          onChange={handleInputChange}
          className="ag-input-field-input ag-checkbox-input"
          type="checkbox"
          aria-label="Press Space to toggle row selection (unchecked)"
        />
      </div>

      <KeywordHighlightRenderer {...props} />
    </div>
  );
};

export default RootRenderer;
