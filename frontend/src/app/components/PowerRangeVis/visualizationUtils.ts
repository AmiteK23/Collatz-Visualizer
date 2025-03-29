import { ChartData, PathsGroupData } from "./types";

/**
 * Calculate Collatz sequence using 1.5x + 0.5 notation (equivalent to (3x+1)/2 for odd numbers)
 * @param start Starting number
 * @param maxSteps Maximum steps to calculate before stopping
 * @returns Array of numbers in the sequence
 */
export const calculateCollatzSequence = (
  start: number,
  maxSteps = 1000
): number[] => {
  const sequence: number[] = [start];
  let current = start;
  let step = 0;

  while (current !== 1 && step < maxSteps) {
    if (current % 2 === 0) {
      // For even numbers, simply divide by 2
      current = current / 2;
    } else {
      // For odd numbers, apply (3x+1)/2 = 1.5x + 0.5
      current = 1.5 * current + 0.5;
    }
    sequence.push(current);
    step++;
  }

  return sequence;
};

/**
 * Generate all sequences for odd numbers in a range
 * @param start Starting number
 * @param end Ending number
 * @returns Object mapping each number to its sequence
 */
export const generateSequencesInRange = (
  start: number,
  end: number
): Record<number, number[]> => {
  const sequences: Record<number, number[]> = {};

  // Only process odd numbers
  for (let n = start + (start % 2 === 0 ? 1 : 0); n <= end; n += 2) {
    const sequence = calculateCollatzSequence(n);
    sequences[n] = sequence;
  }

  return sequences;
};

/**
 * Format data for chart visualization
 * @param sequences Object mapping each number to its sequence
 * @returns Array of data points formatted for Recharts
 */
export const formatDataForChart = (
  sequences: Record<number, number[]>
): ChartData[] => {
  // Find the maximum sequence length to determine how many steps to show
  const maxLength = Math.max(
    ...Object.values(sequences).map((seq) => seq.length)
  );

  // Create data for the chart
  const chartData: ChartData[] = [];

  // Create step entries for each step number
  for (let stepNum = 0; stepNum < maxLength; stepNum++) {
    const stepData: ChartData = { step: stepNum };

    // Add value for each starting number at this step
    Object.entries(sequences).forEach(([startingNum, sequence]) => {
      if (stepNum < sequence.length) {
        stepData[`n${startingNum}`] = sequence[stepNum];
      }
    });

    chartData.push(stepData);
  }

  return chartData;
};

/**
 * Get a color for a line based on the starting number
 * @param n Starting number
 * @returns Color string
 */
export const getLineColor = (n: number): string => {
  const colors = [
    "#ff6384",
    "#36a2eb",
    "#ffce56",
    "#4bc0c0",
    "#9966ff",
    "#ff9f40",
    "#8AC926",
    "#1982C4",
    "#6A4C93",
    "#F9C80E",
    "#FF595E",
    "#FFCA3A",
    "#8AC926",
    "#1982C4",
    "#6A4C93",
  ];

  // Create a deterministic but well-distributed color assignment
  return colors[n % colors.length];
};

/**
 * Generate power of 2 ranges based on min and max power
 * @param minPower Minimum power of 2
 * @param maxPower Maximum power of 2
 * @returns Array of range objects
 */
export const generatePowerRanges = (
  minPower: number,
  maxPower: number
): { start: number; end: number }[] => {
  const ranges: { start: number; end: number }[] = [];

  for (let power = minPower; power < maxPower; power++) {
    ranges.push({
      start: Math.pow(2, power),
      end: Math.pow(2, power + 1) - 1,
    });
  }

  return ranges;
};

/**
 * Group sequences by ranges of powers of 2
 * @param minPower Minimum power of 2
 * @param maxPower Maximum power of 2
 * @returns Object with grouped data
 */
export const groupSequencesByPowerRanges = (
  minPower: number,
  maxPower: number
): PathsGroupData[] => {
  const groups: PathsGroupData[] = [];
  const ranges = generatePowerRanges(minPower, maxPower);

  ranges.forEach((range) => {
    const sequences = generateSequencesInRange(range.start, range.end);
    const chartData = formatDataForChart(sequences);

    groups.push({
      title: `Collatz Paths for Odd Numbers in Interval [${range.start}-${range.end}]`,
      data: chartData,
      range: [range.start, range.end],
    });
  });

  return groups;
};

/**
 * Interface for API response structure
 */
export interface CollatzApiResponse {
  range: [number, number];
  visualizationData: Array<{
    n: number;
    multiplyChain: number[];
    finalEven: number;
    divCount: number;
    timesStayedOdd: number;
  }>;
}

/**
 * Fetch Collatz sequence data from API
 * @param start Starting number
 * @param end Ending number
 * @returns Promise with visualization data
 */
export const fetchCollatzData = async (
  start: number,
  end: number
): Promise<CollatzApiResponse> => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    const response = await fetch(
      `${API_BASE_URL}/collatz/visualization/${start}/${end}`
    );

    if (response.ok) {
      return (await response.json()) as CollatzApiResponse;
    }

    throw new Error("Failed to fetch data");
  } catch (error) {
    console.error("API fetch error:", error);
    throw error;
  }
};

/**
 * Process API data into chart-friendly format
 * @param apiData Data from the API
 * @returns Formatted chart data
 */
export const processApiDataForChart = (
  apiData: CollatzApiResponse | null
): ChartData[] => {
  if (
    !apiData ||
    !apiData.visualizationData ||
    !Array.isArray(apiData.visualizationData)
  ) {
    return [];
  }

  // Extract sequences for each number
  const sequences: Record<number, number[]> = {};

  apiData.visualizationData.forEach((item) => {
    if (item.n && Array.isArray(item.multiplyChain)) {
      // For API data, we need to convert the standard Collatz sequence
      // to use the 1.5x + 0.5 notation
      const sequence: number[] = [];
      let current = item.n;

      // Start with the initial number
      sequence.push(current);

      // Process the sequence using 1.5x + 0.5 notation
      while (current !== 1 && sequence.length < 1000) {
        if (current % 2 === 0) {
          // For even numbers, simply divide by 2
          current = current / 2;
        } else {
          // For odd numbers, apply (3x+1)/2 = 1.5x + 0.5
          current = 1.5 * current + 0.5;
        }
        sequence.push(current);
      }

      sequences[item.n] = sequence;
    }
  });

  return formatDataForChart(sequences);
};
