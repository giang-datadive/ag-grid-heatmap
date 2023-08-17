import { Rule } from "antd/es/form"
import { FunctionComponent } from "react"
import { FormInstance } from "antd"

export type FilterCriteria =
  | "searchVolume"
  | "keyword"
  | "relevancy"
  | "latestOrganicRank"
  | "impressionRankShare"
  | "impressionRank"
  | "exactMatches"
  | "phraseMatches"
  | "broadMatches"
  | "autoMatches"
  | "ppcSpend"
  | "ppcSales"
  | "costPerClicks"
  | "clickThroughRate"
  | "conversionRate"
  | "highlights"

export type FilterCondition =
  | "equals"
  | "notEqual"
  | "contains"
  | "notContains"
  | "lessThanOrEqual"
  | "greaterOrEqual"

/* ------------------------------------------ Condition ----------------------------------------- */
export type ConditionOption = {
  value: FilterCondition
  label: string
  conditionText: string
}

export const conditionPropMap: Record<FilterCondition, ConditionOption> = {
  equals: {
    value: "equals",
    label: "Equals",
    conditionText: "=",
  },
  notEqual: {
    value: "notEqual",
    label: "Not Equals",
    conditionText: "≠",
  },
  lessThanOrEqual: {
    value: "lessThanOrEqual",
    label: "Less than or equals",
    conditionText: "≤",
  },
  greaterOrEqual: {
    value: "greaterOrEqual",
    label: "Greater or equals",
    conditionText: "≥",
  },
  contains: {
    value: "contains",
    label: "Contains",
    conditionText: "contains",
  },
  notContains: {
    value: "notContains",
    label: "Not Contains",
    conditionText: "not contains",
  },
}

const commonConditions: ConditionOption[] = [
  conditionPropMap["equals"],
  conditionPropMap["notEqual"],
]

const numericConditions: ConditionOption[] = [
  ...commonConditions,
  conditionPropMap["lessThanOrEqual"],
  conditionPropMap["greaterOrEqual"],
]

const textConditions: ConditionOption[] = [
  ...commonConditions,
  conditionPropMap["contains"],
  conditionPropMap["notContains"],
]

const integerRules: Rule[] = [
  { required: true, message: "Value is required" },
  {
    pattern: new RegExp(/^[0-9]+$/),
    message: "Value must be a positive integer",
  },
  { min: 0, message: "Value must be positive" },
]
const percentageRules: Rule[] = [
  { required: true, message: "Value is required" },
  {
    pattern: new RegExp(/(^0$)|^[1-9][0-9]?$|(^100$)/),
    message: "Value must be between 0 and 100",
  },
]
const textRules: Rule[] = [{ required: true, message: "Value is required" }]

const highlightConditions: ConditionOption[] = [conditionPropMap["contains"]]

/* ------------------------------------------ Criterias ----------------------------------------- */
export const filterCriteriaOptions: Record<
  FilterCriteria,
  {
    label: string
    type: "numeric" | "text" | "highlight"
    component?: FunctionComponent<{ form: FormInstance }>
    conditions: ConditionOption[]
    symbol: string | null
    rules: Rule[]
  }
> = {
  searchVolume: {
    label: "Search Volume",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: null,
  },
  keyword: {
    label: "Keyword",
    type: "text",
    rules: textRules,
    conditions: textConditions,
    symbol: null,
  },
  highlights: {
    label: "Highlights",
    type: "highlight",
    conditions: highlightConditions,
    symbol: null,
    rules: [],
  },
  relevancy: {
    label: "Relevancy",
    type: "numeric",
    rules: percentageRules,
    conditions: numericConditions,
    symbol: "%",
  },
  latestOrganicRank: {
    label: "Latest Organic Rank",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: null,
  },
  impressionRankShare: {
    label: "Impression Share",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: null,
  },
  impressionRank: {
    label: "Impression Rank",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: null,
  },
  exactMatches: {
    label: "# Exact campaigns",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: "#",
  },
  phraseMatches: {
    label: "# Phrase campaigns",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: "#",
  },
  broadMatches: {
    label: "# Broad campaigns",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: "#",
  },
  autoMatches: {
    label: "# Auto campaigns",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: "#",
  },
  ppcSpend: {
    label: "PPC Spend",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: "$",
  },
  ppcSales: {
    label: "PPC Sales",
    type: "numeric",
    rules: integerRules,
    conditions: numericConditions,
    symbol: null,
  },
  costPerClicks: {
    label: "CPC",
    type: "numeric",
    rules: percentageRules,
    conditions: numericConditions,
    symbol: "%",
  },
  clickThroughRate: {
    label: "CTR",
    type: "numeric",
    rules: percentageRules,
    conditions: numericConditions,
    symbol: "%",
  },
  conversionRate: {
    label: "CVR",
    type: "numeric",
    rules: percentageRules,
    conditions: numericConditions,
    symbol: "%",
  },
}

export const ppcCriterias = [
  "impressionRankShare",
  "impressionRank",
  "exactMatches",
  "phraseMatches",
  "broadMatches",
  "autoMatches",
  "ppcSpend",
  "ppcSales",
  "costPerClicks",
  "clickThroughRate",
  "conversionRate",
]
