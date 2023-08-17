import React, { useEffect, useState } from "react";
import { useColumnDefs } from "../hooks";
import HeatmapTableBase from "./HeatmapTableBase";
import { getHeatmapData, getHighlights } from "@/api";
import { useSetRecoilState } from "recoil";
import { heatmapDataState, highlightsState } from "@/atoms/rank-radar";

const Heatmap = ({
  setError,
}: {
  setError: React.Dispatch<
    React.SetStateAction<{
      status: number;
      message: string;
    } | null>
  >;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const columnDefs = useColumnDefs(false);
  const setHeatmapData = useSetRecoilState(heatmapDataState);
  const setHighlights = useSetRecoilState(highlightsState);

  useEffect(() => {
    setIsLoading(true);
    getHeatmapData()
      // @ts-ignore
      .then(setHeatmapData)
      .finally(() => setIsLoading(false));
    // @ts-ignore
    getHighlights().then(setHighlights);
  }, [setHighlights, setHeatmapData]);

  return <HeatmapTableBase columnDefs={columnDefs} isLoading={isLoading} />;
};

export default Heatmap;
