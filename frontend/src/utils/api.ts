import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // Adjust if using a different backend host

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
