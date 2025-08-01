"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  generatePowerRanges,
  groupSequencesByPowerRanges,
  getLineColor,
  fetchCollatzData,
  processApiDataForChart,
  generateSequencesInRange,
  formatDataForChart,
} from "./visualizationUtils";
import { PathsGroupData, PowerRangeData } from "./types";
import styles from "./PowerRangeVis.module.scss";
import CustomTooltip from "./CustomTooltip";

const PowerRangeVis: React.FC = () => {
  // Add a mounted state to prevent hydration errors
  const [mounted, setMounted] = useState(false);
  const [chartGroups, setChartGroups] = useState<PathsGroupData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [powerRange, setPowerRange] = useState<PowerRangeData>({
    minPower: 4,
    maxPower: 9, // Allow visualization up to 2⁹ (512)
  });
  const [inputValues, setInputValues] = useState({
    minPower: "4",
    maxPower: "9",
  });
  const [useApi, setUseApi] = useState<boolean>(false); // Default to local calculation

  // Create a ref object for the chart refs
  const chartRefsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized function to load data from API
  const loadDataFromApi = useCallback(async () => {
    const ranges = generatePowerRanges(
      powerRange.minPower,
      powerRange.maxPower
    );
    const newChartGroups: PathsGroupData[] = [];

    for (const range of ranges) {
      try {
        const apiData = await fetchCollatzData(range.start, range.end);
        const chartData = processApiDataForChart(apiData);

        newChartGroups.push({
          title: `Collatz Paths for Odd Numbers in Interval [${range.start}-${range.end}]`,
          data: chartData,
          range: [range.start, range.end],
        });
      } catch (err) {
        console.warn(
          `Failed to fetch data for range ${range.start}-${range.end}, using local calculation:`,
          err
        );
        // For this specific range, use local calculation instead of throwing
        const localSequences = generateSequencesInRange(range.start, range.end);
        const chartData = formatDataForChart(localSequences);
        
        newChartGroups.push({
          title: `Collatz Paths for Odd Numbers in Interval [${range.start}-${range.end}] (Local)`,
          data: chartData,
          range: [range.start, range.end],
        });
      }
    }

    setChartGroups(newChartGroups);
  }, [powerRange.minPower, powerRange.maxPower]);

  // Memoized function to calculate data locally
  const loadDataLocally = useCallback(() => {
    const groups = groupSequencesByPowerRanges(
      powerRange.minPower,
      powerRange.maxPower
    );
    setChartGroups(groups);
  }, [powerRange.minPower, powerRange.maxPower]);

  // Load data effect - only run on client side after mounting
  useEffect(() => {
    // Skip data loading during server-side rendering
    if (!mounted) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (useApi) {
          await loadDataFromApi();
        } else {
          loadDataLocally();
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        console.error("Error loading data:", errorMessage);
        setError(
          `Failed to load data: ${errorMessage}. Falling back to local calculation.`
        );
        loadDataLocally();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [powerRange, useApi, loadDataFromApi, loadDataLocally, mounted]);

  // Handle range input changes
  const handleRangeChange = () => {
    const minPower = Math.max(1, parseInt(inputValues.minPower) || 1);
    const maxPower = Math.max(
      minPower + 1,
      parseInt(inputValues.maxPower) || minPower + 1
    );

    // Increase max allowed difference to allow for larger ranges
    const maxAllowedDiff = 5; // Increased from 4 to 10
    const maxAllowedPower = 10; // Hard cap at 10 as mentioned in UI
    const adjustedMaxPower = Math.min(
      maxPower,
      minPower + maxAllowedDiff,
      maxAllowedPower
    );

    setPowerRange({
      minPower,
      maxPower: adjustedMaxPower,
    });

    setInputValues({
      minPower: minPower.toString(),
      maxPower: adjustedMaxPower.toString(),
    });
  };

  // Toggle between API and local calculation
  const toggleDataSource = () => {
    setUseApi(!useApi);
  };

  // Handle SVG download
  const handleDownloadSVG = (index: number) => {
    const chartContainer = chartRefsRef.current[index];
    if (!chartContainer) return;

    const svg = chartContainer.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `collatz_chart_${chartGroups[index]?.range[0]}_${chartGroups[index]?.range[1]}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render a simple placeholder during server-side rendering
  if (!mounted) {
    return (
      <div className={styles.loading}>Loading Collatz visualization...</div>
    );
  }

  return (
    <div className={styles.powerRangeVisWrapper} id="powersOfTwo">
      <div className={styles.usageSection}>
        <div
          className={styles.usageHeader}
          onClick={() => setShowDescription(!showDescription)}
        >
          <h2 className={styles.powerRangeVisTitle}>2ⁿ Range Visualizer</h2>
          <button
            className={`${styles.toggleButton} ${
              showDescription ? styles.spin : ""
            }`}
            aria-label="Toggle the Description of the Powers-of-2 Range Visualization"
          >
            <div className={styles.iconWrapper}>
              <FaChevronDown className={styles.icon} />
            </div>
          </button>
        </div>

        <div
          className={`${styles.usageContent} ${
            showDescription ? "" : styles.closed
          }`}
        >
          <p>
            This visualization shows the <strong>Collatz sequences</strong> for{" "}
            <strong>odd numbers</strong> using the <code>1.5n + 0.5</code>{" "}
            notation (equivalent to <code>(3n + 1) / 2</code>), grouped by
            powers of 2.
          </p>
          <p>
            It highlights how numbers behave across exponential intervals such
            as <code>2ⁿ to 2ⁿ⁺¹</code>, making it easier to observe growth, step
            count, and structural trends.
          </p>
          <ul>
            <li>Track how many steps each number takes to reach 1</li>
            <li>Visualize peaks and growth patterns</li>
            <li>Compare across selected power-of-two ranges</li>
          </ul>
          <p>
            <em>
              {useApi
                ? "Currently using API data for large-range performance."
                : "Currently using local calculations for fast responsiveness."}
            </em>
          </p>
        </div>
      </div>

      <div className={styles.controls}>
        <label>
          Min Power of 2:
          <input
            type="number"
            min="1"
            max="9"
            value={inputValues.minPower}
            onChange={(e) =>
              setInputValues((prev) => ({ ...prev, minPower: e.target.value }))
            }
          />
        </label>
        <label>
          Max Power of 2:
          <input
            type="number"
            min="2"
            max="10"
            value={inputValues.maxPower}
            onChange={(e) =>
              setInputValues((prev) => ({ ...prev, maxPower: e.target.value }))
            }
          />
        </label>
        <button type="button" onClick={handleRangeChange}>
          Update Range
        </button>
        <button
          type="button"
          className={useApi ? styles.activeButton : ""}
          onClick={toggleDataSource}
        >
          {useApi ? "Using API Data" : "Using Local Calculation"}
        </button>
        <div className={styles.helpText}>
          Set ranges like 4-9 to see powers from 2⁴ (16) to 2⁹ (512). <br></br>
          <br></br>
          Currently limited to a maximum power of 2¹⁰ (1024) and a maximum range
          span of 5 (e.g., 4-9, 5-10).
          <br></br>
          Performance optimizations planned to increase both limits in future
          updates.
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading visualization data...</div>
      ) : (
        chartGroups.map((group, index) => (
          <div key={index} className={styles.chartContainer}>
            <h3>{group.title}</h3>
            <div className={styles.chartControls}>
              <button
                type="button"
                className={styles.legendToggle}
                onClick={() => {
                  const legendWrappers = document.querySelectorAll(
                    `.${styles.legendWrapper}`
                  );
                  if (legendWrappers[index]) {
                    legendWrappers[index].classList.toggle(styles.legendHidden);
                  }
                }}
              >
                Toggle Legend
              </button>
              <button
                type="button"
                className={styles.analyzeButton}
                onClick={() => handleDownloadSVG(index)}
              >
                Download SVG
              </button>
            </div>
            <div
              ref={(el) => {
                chartRefsRef.current[index] = el;
              }}
              className={styles.chartWrapper}
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={group.data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="step"
                    label={{
                      value: "Step Number",
                      position: "insideBottomRight",
                      offset: -10,
                    }}
                  />
                  <YAxis
                    label={{
                      value: "Value",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ display: "none" }} />
                  {Object.keys(group.data[0] || {})
                    .filter((key) => key !== "step")
                    .map((key) => {
                      const number = parseInt(key.substring(1));
                      return (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          name={`Starting Number: ${key.substring(1)}`}
                          stroke={getLineColor(number)}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      );
                    })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Custom collapsible legend */}
            <div className={`${styles.legendWrapper} ${styles.legendHidden}`}>
              <div className={styles.legendContent}>
                <div className={styles.legendTitle}>Starting Numbers:</div>
                <div className={styles.legendItems}>
                  {Object.keys(group.data[0] || {})
                    .filter((key) => key !== "step")
                    .map((key) => {
                      const number = parseInt(key.substring(1));
                      return (
                        <div key={key} className={styles.legendItem}>
                          <span
                            className={styles.legendColor}
                            style={{ backgroundColor: getLineColor(number) }}
                          ></span>
                          <span>{key.substring(1)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PowerRangeVis;
