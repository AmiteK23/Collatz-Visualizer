import { CollatzData, RangeData, SixNData, SixNRange } from "./types";

// Configuration for client-side vs server-side processing
export const CLIENT_CALCULATION_THRESHOLD = 100; // Calculate client-side for n <= 100
export const CLIENT_RANGE_CALCULATION_THRESHOLD = 30; // Calculate range client-side if range size <= 30
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Calculate the Collatz sequence for a number on the client side
 */
export const calculateCollatzSequence = (n: number): CollatzData => {
  if (n <= 0) {
    throw new Error("Number must be positive");
  }

  const sequence: number[] = [n];
  const binary_sequence: string[] = [n.toString(2)];
  let iterations = 0;
  let max_value = n;
  let shortcut_count = 0;
  let sum_values = 0;
  let largest_grow_seq = 0;
  let current_grow_seq = 0;
  let closure_point: number | null = null;

  let current = n;

  while (current > 1) {
    sum_values += 1 / current;
    const prev = current;

    if (current % 2 === 0) {
      current = current / 2;
      current_grow_seq = 0;
    } else {
      current = (3 * current + 1) / 2;
      shortcut_count += 1;
      if (current > prev) {
        current_grow_seq += 1;
      } else {
        current_grow_seq = 0;
      }
    }

    largest_grow_seq = Math.max(largest_grow_seq, current_grow_seq);
    sequence.push(current);
    binary_sequence.push(current.toString(2));
    iterations += 1;
    max_value = Math.max(max_value, current);

    // Check for closure points
    if (closure_point === null) {
      if (current === 5) {
        closure_point = 5;
      } else if (current > 0 && (current & (current - 1)) === 0) {
        // Check if power of 2
        closure_point = current;
      }
    }
  }

  return {
    number: n,
    iterations,
    max_value,
    shortcut_count,
    sum_values,
    largest_grow_seq,
    sequence,
    binary_sequence,
    closure_point: closure_point ?? 1,
  };
};

/**
 * Fetch or calculate Collatz sequence data for a single number
 */
export const getCollatzData = async (number: number): Promise<CollatzData> => {
  if (number <= 0) {
    throw new Error("Number must be positive");
  }

  // Use client-side calculation for small numbers
  if (number <= CLIENT_CALCULATION_THRESHOLD) {
    console.log(`Calculating Collatz for ${number} on client-side`);
    return calculateCollatzSequence(number);
  }

  // Use server-side calculation for larger numbers
  console.log(`Fetching Collatz for ${number} from server`);
  const response = await fetch(`${BASE_URL}/collatz/${number}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch or calculate Collatz sequence data for a range of numbers
 */
export const getCollatzRangeData = async (
  start: number,
  end: number
): Promise<RangeData> => {
  if (start <= 0 || end <= 0 || start > end) {
    throw new Error(
      "Invalid range. Start and end must be positive with start ≤ end"
    );
  }

  const rangeSize = end - start + 1;

  // For small ranges, calculate client-side
  if (
    rangeSize <= CLIENT_RANGE_CALCULATION_THRESHOLD &&
    end <= CLIENT_CALCULATION_THRESHOLD
  ) {
    console.log(`Calculating range ${start}-${end} on client-side`);
    return calculateCollatzRange(start, end);
  }

  // For larger ranges, use server
  console.log(`Fetching range ${start}-${end} from server`);
  const response = await fetch(`${BASE_URL}/collatz/range/${start}/${end}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch range data: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Calculate Collatz data for a range of numbers on the client side
 */
const calculateCollatzRange = (start: number, end: number): RangeData => {
  const details: CollatzData[] = [];
  let max_iterations = 0;
  let max_iterations_num = 0;
  let max_value = 0;
  let max_value_num = 0;
  let max_shortcut = 0;
  let max_shortcut_num = 0;
  let max_sum_values = 0;
  let max_sum_num = 0;
  let max_grow_seq = 0;
  let max_grow_seq_num = 0;

  for (let i = start; i <= end; i++) {
    const result = calculateCollatzSequence(i);
    details.push(result);

    if (result.iterations > max_iterations) {
      max_iterations = result.iterations;
      max_iterations_num = i;
    }

    if (result.max_value > max_value) {
      max_value = result.max_value;
      max_value_num = i;
    }

    if (result.shortcut_count > max_shortcut) {
      max_shortcut = result.shortcut_count;
      max_shortcut_num = i;
    }

    if (result.sum_values > max_sum_values) {
      max_sum_values = result.sum_values;
      max_sum_num = i;
    }

    if (result.largest_grow_seq > max_grow_seq) {
      max_grow_seq = result.largest_grow_seq;
      max_grow_seq_num = i;
    }
  }

  return {
    range: [start, end],
    max_iterations: { number: max_iterations_num, iterations: max_iterations },
    max_value: { number: max_value_num, value: max_value },
    max_shortcut: { number: max_shortcut_num, count: max_shortcut },
    max_sum_values: { number: max_sum_num, sum: max_sum_values },
    max_grow_seq: { number: max_grow_seq_num, value: max_grow_seq },
    details,
  };
};

/**
 * Process range data to extract 6n±1 numbers
 */
export const process6NNumbers = (rangeData: RangeData): SixNRange => {
  const filtered = rangeData.details.filter(
    (d) => d.number % 6 === 1 || d.number % 6 === 5
  );

  const numbers: SixNData[] = filtered.map((d) => ({
    number: d.number,
    iterations: d.iterations,
    max_value: d.max_value,
    type: "6n±1",
    closure_point: d.closure_point,
    binary_sequence: d.binary_sequence,
  }));

  const total_numbers = numbers.length;
  const avg_iterations =
    numbers.reduce((sum, n) => sum + n.iterations, 0) / total_numbers || 0;

  let max_iterations = 0,
    max_iterations_number = 0;
  let max_value = 0,
    max_value_number = 0;
  let max_shortcut = 0,
    max_shortcut_number = 0;
  let max_sum = 0,
    max_sum_number = 0;
  let max_grow_seq = 0,
    max_grow_seq_number = 0;

  const closure_distribution: { [key: string]: number } = {};

  for (const d of filtered) {
    if (d.iterations > max_iterations) {
      max_iterations = d.iterations;
      max_iterations_number = d.number;
    }
    if (d.max_value > max_value) {
      max_value = d.max_value;
      max_value_number = d.number;
    }
    if (d.shortcut_count > max_shortcut) {
      max_shortcut = d.shortcut_count;
      max_shortcut_number = d.number;
    }
    if (d.sum_values > max_sum) {
      max_sum = d.sum_values;
      max_sum_number = d.number;
    }
    if (d.largest_grow_seq > max_grow_seq) {
      max_grow_seq = d.largest_grow_seq;
      max_grow_seq_number = d.number;
    }

    const key = d.closure_point?.toString() ?? "Unknown";
    closure_distribution[key] = (closure_distribution[key] || 0) + 1;
  }

  return {
    range: rangeData.range,
    numbers,
    stats: {
      total_numbers,
      avg_iterations,
      max_iterations,
      max_iterations_number,
      max_value,
      max_value_number,
      max_shortcut,
      max_shortcut_number,
      max_sum,
      max_sum_number,
      max_grow_seq,
      max_grow_seq_number,
      closure_distribution,
    },
  };
};

/**
 * Fetch or process 6n±1 analysis data
 */
export const get6NAnalysisData = async (
  start: number,
  end: number
): Promise<SixNRange> => {
  const rangeData = await getCollatzRangeData(start, end);
  return process6NNumbers(rangeData);
};

/**
 * Generate CSV string for different types of data
 */
export const generateCSV = (
  type: "single" | "range" | "sixN",
  data: CollatzData | RangeData | SixNRange
): string => {
  let csvContent = "";

  if (type === "single" && "sequence" in data) {
    csvContent += "Step,Value,Binary,Closure Point\n";
    (data as CollatzData).sequence.forEach((value, index) => {
      csvContent += `${index},${value},${
        (data as CollatzData).binary_sequence?.[index] || "N/A"
      },${(data as CollatzData).closure_point || "N/A"}\n`;
    });
  } else if (type === "range" && "details" in data) {
    csvContent +=
      "Number,Iterations,Max Value,Sum Values,Shortcuts,Growth Sequence,Closure Point\n";
    (data as RangeData).details.forEach((entry) => {
      csvContent += `${entry.number},${entry.iterations},${
        entry.max_value
      },${entry.sum_values.toFixed(4)},${entry.shortcut_count},${
        entry.largest_grow_seq
      },${entry.closure_point || "N/A"}\n`;
    });
  } else if (type === "sixN" && "numbers" in data) {
    csvContent += "Number,Type,Iterations,Max Value,Closure Point,Binary\n";
    (data as SixNRange).numbers.forEach((entry) => {
      csvContent += `${entry.number},${entry.type},${entry.iterations},${
        entry.max_value
      },${entry.closure_point || "N/A"},${
        entry.binary_sequence?.join(";") || "N/A"
      }\n`;
    });
  }

  return csvContent;
};

/**
 * Download CSV data
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
