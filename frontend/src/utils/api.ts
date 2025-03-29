import axios from "axios";
import { getApiBaseUrl } from "@/utils/getApiBaseUrl"; // adjust the path if needed

const API_URL = getApiBaseUrl();

// Fetch Collatz sequence for a single number
export const fetchCollatzNumber = async (number: number) => {
  try {
    const response = await axios.get(`${API_URL}/collatz/${number}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Collatz number:", error);
    throw error;
  }
};

// Fetch Collatz data for a range of numbers
export const fetchCollatzRange = async (start: number, end: number) => {
  try {
    const response = await axios.get(
      `${API_URL}/collatz/range/${start}/${end}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Collatz range:", error);
    throw error;
  }
};
