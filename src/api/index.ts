import heatmapData from "@/data/heatmap.json";
import highlightData from "@/data/highlight.json";

export const getHeatmapData = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(heatmapData);
    }, 2000);
  });

export const getHighlights = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(highlightData);
    }, 1000);
  });
