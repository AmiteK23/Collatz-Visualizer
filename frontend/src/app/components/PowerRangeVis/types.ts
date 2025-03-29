/**
 * Interface for power range settings
 */
export interface PowerRangeData {
  minPower: number;
  maxPower: number;
}

/**
 * Interface for chart data point structure
 */
export interface ChartData {
  step: number;
  [key: string]: number | string;
}

/**
 * Interface for grouped chart data
 */
export interface PathsGroupData {
  title: string;
  data: ChartData[];
  range: [number, number];
}
