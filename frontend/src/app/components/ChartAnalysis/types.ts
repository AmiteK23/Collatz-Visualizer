// ChartAnalysis types

export interface CollatzData {
  number: number;
  iterations: number;
  max_value: number;
  shortcut_count: number;
  sum_values: number;
  largest_grow_seq: number;
  sequence: number[];
  closure_point?: number | string;
  binary_sequence?: string[];
}

export interface RangeData {
  range: [number, number];
  max_iterations: { number: number; iterations: number };
  max_value: { number: number; value: number };
  max_shortcut: { number: number; count: number };
  max_sum_values: { number: number; sum: number };
  max_grow_seq: { number: number; value: number };
  details: CollatzData[];
}

export interface SixNData {
  number: number;
  iterations: number;
  max_value: number;
  type: "6n±1"; // Changed to match backend
  closure_point?: number | string;
  binary_sequence?: string[];
}

export interface SixNRange {
  range: [number, number];
  numbers: SixNData[];
  stats: {
    total_numbers: number;
    avg_iterations: number;

    max_iterations: number;
    max_iterations_number: number;

    max_value: number;
    max_value_number: number;

    max_shortcut: number;
    max_shortcut_number: number;

    max_sum: number;
    max_sum_number: number;

    max_grow_seq: number;
    max_grow_seq_number: number;

    closure_distribution: { [key: string]: number };
  };
}

// Used for 3D visualization
export interface VisualizationData {
  n: number;
  multiplyChain: number[];
  finalEven: number;
  divCount: number;
  timesStayedOdd: number;
}

export interface VisualizationRangeData {
  range: [number, number];
  visualizationData: VisualizationData[];
}
