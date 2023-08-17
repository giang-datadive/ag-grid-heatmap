import React from "react";
import { ICellRendererParams } from "ag-grid-community";

const BidRangeRenderer = ({ data }: ICellRendererParams) => {
  const { bidRange, bid } = data;

  return (
    <>
      <span>{bid}</span>
      <span className="text-secondary-4 ml-2">{bidRange}</span>
    </>
  );
};

export default BidRangeRenderer;
