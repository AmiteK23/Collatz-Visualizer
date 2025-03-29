/**
 * Data type describing the final multiply step for an odd number n.
 */
export interface MulData {
  n: number;
  multiplyChain: number[];
  finalEven: number;
  divCount: number;
  timesStayedOdd: number;
}

/**
 * Data structure for Collatz sequence analysis as returned by the backend
 */
export interface CollatzData {
  number: number;
  iterations: number;
  max_value: number;
  shortcut_count: number;
  sum_values: number;
  largest_grow_seq: number;
  sequence: number[];
  binary_sequence: string[];
  closure_point: number;
}

/**
 * Data structure for range analysis response from backend
 */
export interface CollatzRangeResponse {
  range: [number, number];
  max_iterations: { number: number; iterations: number };
  max_value: { number: number; value: number };
  max_shortcut: { number: number; count: number };
  max_sum_values: { number: number; sum: number };
  max_grow_seq: { number: number; value: number };
  details: CollatzData[];
}
