import { CollatzData, CollatzRangeResponse, MulData } from "./types";
import { getApiBaseUrl } from "../../../utils/getApiBaseUrl";

//API URL
const API_BASE_URL = getApiBaseUrl();

/**
 * Interface for visualization data response from backend
 */
interface VisualizationDataResponse {
  range: [number, number];
  visualizationData: MulData[];
}

/**
 * Fetch Collatz data for a specific number from the backend
 */
export async function fetchCollatzData(number: number): Promise<CollatzData> {
  const response = await fetch(`${API_BASE_URL}/collatz/${number}`);

  if (!response.ok) {
    throw new Error(`Error fetching Collatz data: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch Collatz data for a range of numbers from the backend
 */
export async function fetchCollatzRange(
  start: number,
  end: number
): Promise<CollatzRangeResponse> {
  const response = await fetch(`${API_BASE_URL}/collatz/range/${start}/${end}`);

  if (!response.ok) {
    throw new Error(
      `Error fetching Collatz range data: ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Fetch visualization-specific data directly from the backend
 * Using the new endpoint that returns data already formatted for visualization
 * Falls back to standard range endpoint if visualization endpoint is not available
 */
export async function fetchVisualizationData(
  start: number,
  end: number
): Promise<MulData[]> {
  try {
    // First try the specific visualization endpoint
    const response = await fetch(
      `${API_BASE_URL}/collatz/visualization/${start}/${end}`
    );

    if (response.ok) {
      const data: VisualizationDataResponse = await response.json();
      return data.visualizationData;
    }

    console.log(
      "Visualization endpoint not available, falling back to standard endpoint"
    );

    // Fall back to the standard range endpoint
    return await fetchCollatzRangeAndConvert(start, end);
  } catch (error) {
    console.error("Error with visualization endpoint:", error);
    // Fall back to the standard range endpoint
    return await fetchCollatzRangeAndConvert(start, end);
  }
}

/**
 * Fetch standard collatz range data and convert it to visualization format
 * Used as a fallback when the visualization endpoint isn't available
 */
async function fetchCollatzRangeAndConvert(
  start: number,
  end: number
): Promise<MulData[]> {
  const rangeData = await fetchCollatzRange(start, end);
  return convertToMulData(rangeData.details);
}

/**
 * Convert backend Collatz data to the format needed for visualization
 * This is a fallback in case the direct visualization endpoint isn't available
 */
export function convertToMulData(collatzData: CollatzData[]): MulData[] {
  return collatzData
    .filter((data) => data.number % 2 === 1) // Only use odd numbers
    .map((data) => {
      // Find index where sequence becomes even
      const oddSequence = [];
      let index = 0;

      // Build the multiply chain (sequence until first even number)
      while (index < data.sequence.length && data.sequence[index] % 2 === 1) {
        oddSequence.push(data.sequence[index]);
        index++;
      }

      // If we found an even number in the sequence
      if (index < data.sequence.length) {
        const finalEven = data.sequence[index];

        // Count how many times we can divide by 2
        let divCount = 0;
        let tempCurrent = finalEven;

        while (tempCurrent % 2 === 0 && tempCurrent > 0) {
          tempCurrent = Math.floor(tempCurrent / 2);
          divCount++;
        }

        return {
          n: data.number,
          multiplyChain: oddSequence,
          finalEven: finalEven,
          divCount: divCount,
          timesStayedOdd: oddSequence.length - 1, // Excluding the starting number
        };
      }

      // Fallback for numbers that don't follow expected pattern
      return {
        n: data.number,
        multiplyChain: [data.number],
        finalEven: 0,
        divCount: 0,
        timesStayedOdd: 0,
      };
    });
}
