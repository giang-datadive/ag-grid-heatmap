import { min as getMin, max as getMax, uniqBy } from "lodash";
import {
  CellBorder,
  HeatmapRank,
  HeatmapResponse,
  HeatmapRow,
  HeatMapStateData,
  Highlight,
  InterpolatedData,
  OverviewResponse,
  OverviewRow,
  OverviewStateData,
  RootItem,
  RootsResponse,
} from "./types/rank-radar";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { DEFAULT_HIGHLIGHT_COLOR, KrtDateFormat } from "./constants";
import { uniqueId } from "lodash";

export const getStartOfDayInTimeZone = (
  date: Date | string | number,
  timeZone: string
) => {
  const dateString = formatInTimeZone(date, timeZone, "yyyy-MM-dd");
  return toDate(dateString, { timeZone });
};

export const formatDate = (
  date?: Date | number | null,
  dateFormat = "MM/dd/yyyy",
  fallback = "N/A",
  timeZone = "UTC"
): string => {
  try {
    if (!date) return fallback;

    // @ts-ignore
    return formatInTimeZone(date, timeZone, dateFormat);
  } catch (e) {
    return fallback;
  }
};

export const formatPercentage = (
  fraction: number,
  format = "0,0[.]00",
  rounded?: boolean
) => {
  return `20%`;
};

export const formatCellNumber = (value: number) => {
  if (value < 1000) {
    return value;
  }

  if (value > 1000000) {
    return `${Math.round(value / 100000) / 10}m`;
  }

  if (value > 10000) {
    return `${Math.floor(value / 1000)}k`;
  }

  return `${Math.round(value / 100) / 10}k`;
};

export const getCellRankColor = (value: number) => {
  if (value === null || value > 100) {
    return "#EB9273";
  }
  if (!value) {
    return "transparent";
  }

  if (value >= 1 && value <= 8) {
    return "#99D098";
  }

  if (value >= 9 && value <= 12) {
    return "#DFED8A";
  }

  if (value >= 13 && value <= 24) {
    return "#FCE883";
  }

  if (value >= 25 && value <= 48) {
    return "#F9D680";
  }

  if (value >= 49 && value <= 72) {
    return "#F6C386";
  }

  if (value >= 73 && value <= 86) {
    return "#F3B084";
  }

  if (value >= 87 && value <= 100) {
    return "#EBA187";
  }

  return "#E6E8EB";
};

export const getCellColor = (() => {
  let cachedKrtId = "";
  let cachedValue: Record<string, { min: number; max: number }> = {};

  return (value: number, data: OverviewRow, krtId: string) => {
    if (!value) {
      return "#E6E8EB";
    }

    if (cachedKrtId !== krtId) {
      cachedValue = {};
      cachedKrtId = krtId;
    }
    const values = Object.values(data)
      .filter((item) => !isNaN(+item))
      .map((value) => +value);
    if (!cachedValue[data.type]) {
      cachedValue[data.type] = {
        min: getMin(values) || 0,
        max: getMax(values) || 0,
      };
    }
    const { min, max } = cachedValue[data.type];
    const colorStart = { red: 245, green: 250, blue: 245 };
    const colorEnd = { red: 153, green: 208, blue: 152 };
    const color = { red: 245, green: 250, blue: 245 };

    return `rgb(${color.red}, ${color.green}, ${color.blue})`;
  };
})();

export const getDateFromString = (stringDate: string, timeZone: string) =>
  toDate(stringDate, { timeZone });

export const formatAggregateRow = (
  aggregateData: HeatmapResponse["aggregate"],
  timeZone: string
): HeatmapRow => {
  const organicRankData: Record<string, number> = {};
  const impressionRankData: Record<string, number> = {};
  const sponsoredRankData: Record<string, number> = {};
  aggregateData.average.ranks.forEach((rank) => {
    const date = getMarketplaceDateFromBucket(rank.bucket, timeZone);
    organicRankData[date] = rank.organicRank;
    impressionRankData[date] = rank.impressionRank;
    sponsoredRankData[date] = rank.sponsoredRank;
  });

  const { adData } = aggregateData.average;

  return {
    id: "aggregateRow",
    rowId: "aggregateRow",
    keyword: "",
    organicRankData,
    impressionRankData,
    isAggregateRow: true,
    searchVolume: aggregateData.total.searchVolume,
    svShare: 1,
    relevancy: 1,
    impressionRank: adData?.impressionRank,
    impressionRankShare: adData?.impressionRankShare / 100,
    exactMatches: adData?.exactMatches,
    phraseMatches: adData?.phraseMatches,
    broadMatches: adData?.broadMatches,
    autoMatches: adData?.autoMatches,
    ppcSales: adData?.ppcSales,
    currency: adData?.currency,
    ppcSpend: adData?.ppcSpend,
    costPerClicks: adData?.costPerClicks,
    clickThroughRate: adData?.clickThroughRate,
    conversionRate: adData?.conversionRate,
    totalClicks: adData?.totalClicks,
    acos: adData?.acos,
  } as HeatmapRow;
};

export const getRankObject = (
  ranks: HeatmapRank[],
  timeZone: string
): {
  organicRankData: Record<string, number | null>;
  impressionRankData: Record<string, number | null>;
  sponsoredRankData: Record<string, number | null>;
} => {
  const organicRankData: Record<string, number | null> = {};
  const impressionRankData: Record<string, number | null> = {};
  const sponsoredRankData: Record<string, number | null> = {};
  ranks.forEach((item) => {
    const date = getMarketplaceDateFromBucket(item.bucket, timeZone);
    organicRankData[date] = item.isInterpolated ? null : item.organicRank;
    impressionRankData[date] = item.impressionRank;
    sponsoredRankData[date] = item.sponsoredRank;
  });

  return {
    organicRankData,
    impressionRankData,
    sponsoredRankData,
  };
};

export const formatHighlightsData = (highlights: Highlight[]) => {
  return highlights.map((highlight) => ({
    ...highlight,
    color:
      highlight.color === "none" || !highlight.color
        ? DEFAULT_HIGHLIGHT_COLOR
        : highlight.color,
  }));
};

export const getInterpolatedData = (
  ranks: HeatmapRank[],
  timeZone: string,
  dates: string[]
) => {
  const MAX_GAP = 3;
  const rankMap: Record<string, HeatmapRank> = {};
  ranks.forEach((rank) => {
    const date = getMarketplaceDateFromBucket(rank.bucket, timeZone);
    rankMap[date] = rank;
  });
  const interpolatedData: Record<string, InterpolatedData> = {};
  let i = 0;
  while (i < dates.length) {
    const date = dates[i];
    const prevDate = dates[i - 1];
    const isCurrentDateInterpolated =
      rankMap[date] && rankMap[date].isInterpolated;
    const isPrevDateNotInterpolated =
      !rankMap[prevDate] ||
      (rankMap[prevDate] && !rankMap[prevDate].isInterpolated);

    if (!isPrevDateNotInterpolated || !isCurrentDateInterpolated) {
      i++;
      continue;
    }
    const gapDateMap: Record<string, boolean> = {};
    for (let j = i; j < Math.min(dates.length, i + MAX_GAP + 1); j++) {
      const currentDate = dates[j];
      const nextDate = dates[j + 1];
      if (!currentDate) break;
      gapDateMap[currentDate] = true;
      const isCurrentDateInterpolated =
        rankMap[currentDate] && rankMap[currentDate].isInterpolated;
      const isNextDateNotInterpolated =
        !rankMap[nextDate] ||
        (rankMap[nextDate] && !rankMap[nextDate].isInterpolated);

      if (isCurrentDateInterpolated && isNextDateNotInterpolated) {
        const gapDates = Object.keys(gapDateMap);
        const firstDateIndex = gapDates.findIndex((dateString) => {
          const date = getDateFromString(dateString, timeZone);

          return date.getDate() === 1;
        });
        const commonValue = {
          lastDate: currentDate,
          startDateText: format(getDateFromString(date, timeZone), "MMM d"),
          endDateText: format(
            getDateFromString(currentDate, timeZone),
            "MMM d"
          ),
        };
        // https://white-sand.atlassian.net/browse/RS-5185
        if (firstDateIndex === -1 || gapDates.length === 1) {
          interpolatedData[date] = {
            ...commonValue,
            startValue:
              rankMap[prevDate]?.organicRank || rankMap[date].organicRank,
            endValue:
              rankMap[nextDate]?.organicRank ||
              rankMap[currentDate].organicRank,
            cellCount: gapDates.length,
            dates: gapDates,
          };
        } else {
          const firstDate = gapDates[firstDateIndex];
          const extraGapDates = gapDates.slice(firstDateIndex);

          interpolatedData[date] = {
            ...commonValue,
            startValue:
              rankMap[prevDate]?.organicRank || rankMap[date].organicRank,
            endValue: rankMap[firstDate].organicRank,
            cellCount: gapDates.slice(0, firstDateIndex).length,
            dates: gapDates.slice(0, firstDateIndex),
          };

          interpolatedData[firstDate] = {
            ...commonValue,
            startValue: rankMap[firstDate].organicRank,
            endValue:
              rankMap[nextDate]?.organicRank ||
              rankMap[extraGapDates[extraGapDates.length - 1]].organicRank,
            cellCount: extraGapDates.length,
            dates: extraGapDates,
          };
        }
        gapDates.forEach((date) => {
          if (!interpolatedData[date]) {
            interpolatedData[date] = { hidden: true } as InterpolatedData;
          }
        });
        break;
      }
    }
    i++;
  }

  return { interpolatedData };
};

export const formatHeatmapData = (
  data: HeatmapResponse,
  timeZone: string,
  dates: string[]
): HeatMapStateData => {
  const { keywords, aggregate, indicators } = data;
  const heatmapRows = keywords.map((keyword) => {
    return {
      id: keyword.keywordId,
      rowId: keyword.keywordId,
      keyword: keyword.keyword,
      searchVolume: keyword.searchVolume,
      svShare: keyword.svShare,
      relevancy: keyword.relevancy,
      refreshedAt: keyword.refreshedAt,
      impressionRank: keyword.adData?.impressionRank,
      impressionRankShare: keyword.adData?.impressionRankShare / 100,
      exactMatches: keyword.adData?.exactMatches,
      phraseMatches: keyword.adData?.phraseMatches,
      broadMatches: keyword.adData?.broadMatches,
      autoMatches: keyword.adData?.autoMatches,
      ppcSales: keyword.adData?.ppcSales,
      currency: keyword.adData?.currency,
      ppcSpend: keyword.adData?.ppcSpend,
      costPerClicks: keyword.adData?.costPerClicks,
      clickThroughRate: keyword.adData?.clickThroughRate,
      conversionRate: keyword.adData?.conversionRate,
      totalClicks: keyword.adData?.totalClicks,
      acos: keyword.adData?.acos,
      ...getInterpolatedData(keyword?.ranks || [], timeZone, dates),
      ...getRankObject(keyword?.ranks || [], timeZone),
    } as HeatmapRow;
  });
  const {
    impressionRank,
    autoMatches,
    broadMatches,
    exactMatches,
    phraseMatches,
  } = aggregate.average.adData;

  return {
    heatmapRows,
    indicators,
    aggregateRow: formatAggregateRow(aggregate, timeZone),
    hasPPCData:
      impressionRank +
        autoMatches +
        broadMatches +
        exactMatches +
        phraseMatches >
      0,
  };
};

export const formatRootsData = (
  rootsData: RootsResponse,
  timeZone: string,
  dates: string[]
): HeatMapStateData => {
  const { roots, aggregate, indicators } = rootsData;
  const heatmapRows: HeatmapRow[] = [];
  const formattedRoots = roots.map((root) => {
    const rootId = uniqueId();
    heatmapRows.push({
      id: rootId,
      rowId: rootId,
      keyword: root.root,
      searchVolume: root.broadSearchVolume,
      svShare: root.broadSearchVolumeRatio,
      orgHierarchy: [root.root],
      keywords: root.keywords,
      impressionRank: root.adData?.impressionRank,
      impressionRankShare: root.adData?.impressionRankShare
        ? root.adData?.impressionRankShare / 100
        : 0,
      exactMatches: root.adData?.exactMatches,
      phraseMatches: root.adData?.phraseMatches,
      broadMatches: root.adData?.broadMatches,
      autoMatches: root.adData?.autoMatches,
      ppcSales: root.adData?.ppcSales,
      currency: root.adData?.currency,
      ppcSpend: root.adData?.ppcSpend,
      costPerClicks: root.adData?.costPerClicks,
      clickThroughRate: root.adData?.clickThroughRate,
      conversionRate: root.adData?.conversionRate,
      totalClicks: root.adData?.totalClicks,
      acos: root.adData?.acos,
      ...getInterpolatedData(root.ranks || [], timeZone, dates),
      ...getRankObject(root.ranks || [], timeZone),
    });
    root.keywords.forEach((kw) => {
      heatmapRows.push({
        id: kw.keywordId,
        rowId: `${kw.keywordId}_${rootId}`,
        orgHierarchy: [root.root, kw.keyword],
        keyword: kw.keyword,
        searchVolume: kw.searchVolume,
        svShare: kw.svShare,
        relevancy: kw.relevancy,
        refreshedAt: kw.refreshedAt,
        impressionRank: kw.adData?.impressionRank,
        impressionRankShare: kw.adData?.impressionRankShare / 100,
        exactMatches: kw.adData?.exactMatches,
        phraseMatches: kw.adData?.phraseMatches,
        broadMatches: kw.adData?.broadMatches,
        autoMatches: kw.adData?.autoMatches,
        ppcSales: kw.adData?.ppcSales,
        currency: kw.adData?.currency,
        ppcSpend: kw.adData?.ppcSpend,
        costPerClicks: kw.adData?.costPerClicks,
        clickThroughRate: kw.adData?.clickThroughRate,
        conversionRate: kw.adData?.conversionRate,
        totalClicks: kw.adData?.totalClicks,
        acos: kw.adData?.acos,
        ...getInterpolatedData(kw.ranks || [], timeZone, dates),
        ...getRankObject(kw.ranks || [], timeZone),
      });
    });

    return { ...root, id: rootId };
  });
  const {
    impressionRank,
    autoMatches,
    broadMatches,
    exactMatches,
    phraseMatches,
  } = aggregate.average.adData;

  return {
    heatmapRows,
    aggregateRow: formatAggregateRow(aggregate, timeZone),
    indicators,
    roots: formattedRoots,
    hasPPCData:
      impressionRank +
        autoMatches +
        broadMatches +
        exactMatches +
        phraseMatches >
      0,
  };
};

export const formatOverviewGraphData = (data: OverviewResponse) => {
  const { overview } = data;
  return overview.map((item) => {
    const { bucket, avgOrganicRank, top10kw, top10sv } = item;
    const date = new Date(bucket);

    return {
      avgOrganicRank,
      top10kw,
      top10sv,
      date,
    };
  });
};

export const formatOverviewData = (
  data: OverviewResponse,
  timeZone: string
): OverviewStateData => {
  const { overview, indicators } = data;
  const avgRankRowData: Record<string, number> = {};
  const top10KwRowData: Record<string, number> = {};
  const top10SvRowData: Record<string, number> = {};
  const top50KwRowData: Record<string, number> = {};
  const top50SvRowData: Record<string, number> = {};
  overview.forEach((item) => {
    const dateString = getMarketplaceDateFromBucket(item.bucket, timeZone);
    avgRankRowData[dateString] = +item.avgOrganicRank;
    top10KwRowData[dateString] = +item.top10kw;
    top10SvRowData[dateString] = +item.top10sv;
    top50KwRowData[dateString] = +item.top50kw;
    top50SvRowData[dateString] = +item.top50sv;
  });

  return {
    overview: [
      { ...avgRankRowData, type: "avgRank" },
      { ...top10KwRowData, type: "top10Kw" },
      { ...top10SvRowData, type: "top10Sv" },
      { ...top50KwRowData, type: "top50Kw" },
      { ...top50SvRowData, type: "top50Sv" },
    ] as OverviewRow[],
    indicators,
  };
};

export const generateDates = (
  date: Date = new Date(),
  number = 30,
  timeZone = "UTC"
) => {
  const dates: string[] = [];
  const startDate = getStartOfDayInTimeZone(date, timeZone);
  for (let i = 0; i < number; i++) {
    dates.unshift(formatDate(startDate, KrtDateFormat, "N/A", timeZone));
    startDate.setDate(startDate.getDate() - 1);
  }
  return dates;
};

/**
 * Timescale's time_bucket function returns a timestamp that is the start of the most recent interval specified by the parameter stride
 * In Timescale DB, the interval is set to '1 day', which means that we should consider the end of the UTC date specified by bucket string
 */
export const getMarketplaceDateFromBucket = (
  bucket: string | number | Date,
  timeZone = "UTC",
  format = "yyyy-MM-dd",
  fallback = ""
) => {
  try {
    return formatInTimeZone(bucket, timeZone, format);
  } catch (error) {
    return fallback;
  }
};

export const getKeywordHighlightsMap = (
  highlights: Highlight[],
  isRootMode = false,
  roots?: RootItem[]
) => {
  const result: Record<string, Highlight[]> = {};
  highlights.forEach((item) => {
    if (!item.krtkeywordid) return;
    if (!result[item.krtkeywordid]) {
      result[item.krtkeywordid] = [];
    }
    result[item.krtkeywordid].push(item);
  });
  if (isRootMode && roots) {
    roots.forEach((root) => {
      const rootHighlights: Highlight[] = [];
      root.keywords?.forEach((kw) => {
        rootHighlights.push(...(result[kw.keywordId] || []));
      });

      if (rootHighlights.length) {
        result[root.id || ""] = uniqBy(rootHighlights, "id");
      }
    });
  }

  return result;
};

export const getBorderByDate = (
  date: string,
  highlights: Highlight[],
  isNaturalTimeline: boolean,
  timeZone: string
) => {
  const columnDate = getDateFromString(date, timeZone);
  const colors: CellBorder = {};

  highlights.forEach((item) => {
    if (!item.startAt || !item.endAt) return;
    const startDate = getStartOfDayInTimeZone(item.startAt, timeZone);
    const endDate = getStartOfDayInTimeZone(item.endAt, timeZone);
    const isInRange =
      isBefore(columnDate, endDate) && isAfter(columnDate, startDate);

    const isStartedCell = isNaturalTimeline
      ? isEqual(startDate, columnDate)
      : isEqual(endDate, columnDate);
    if (isStartedCell) {
      colors.left = item.color || "";
      colors.top = item.color || "";
      if (!colors.bottom) {
        colors.bottom = item.color || "";
      }
    }

    const isEndedCell = isNaturalTimeline
      ? isEqual(endDate, columnDate)
      : isEqual(startDate, columnDate);
    if (isEndedCell) {
      if (!colors.right) {
        colors.right = item.color || "";
      }
      colors.top = item.color || "";
      if (!colors.bottom) {
        colors.bottom = item.color || "";
      }
    }

    if (isInRange) {
      colors.top = item.color || "";
      if (!colors.bottom) {
        colors.bottom = item.color || "";
      }
    }
  });

  return colors;
};

export const getCellBordersFromHighlights = (
  dates: string[],
  highlights: Highlight[],
  isNatureTimeline: boolean,
  timeZone: string,
  isRootMode?: boolean,
  roots?: RootItem[]
) => {
  const keywordHighlightsMap = getKeywordHighlightsMap(
    highlights,
    isRootMode,
    roots
  );
  const result: Record<string, CellBorder> = {};
  dates.forEach((date) => {
    Object.entries(keywordHighlightsMap).forEach(([keywordId, highlights]) => {
      const border = getBorderByDate(
        date,
        highlights,
        isNatureTimeline,
        timeZone
      );
      if (Object.keys(border).length) {
        result[`${keywordId}_${date}`] = border;
      }
    });
  });

  return result;
};
