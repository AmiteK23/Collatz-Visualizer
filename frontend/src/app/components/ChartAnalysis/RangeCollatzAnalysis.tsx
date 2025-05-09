"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RangeData } from "./types";
import {
  getCollatzRangeData,
  generateCSV,
  downloadCSV,
  CLIENT_RANGE_CALCULATION_THRESHOLD,
  CLIENT_CALCULATION_THRESHOLD,
} from "./collatzUtils";
import styles from "./ChartAnalysis.module.scss";
import { FaQuestionCircle } from "react-icons/fa";

const RangeCollatzAnalysis: React.FC = () => {
  const [rangeStart, setRangeStart] = useState<string | number>("");
  const [rangeEnd, setRangeEnd] = useState<string | number>("");
  const [rangeData, setRangeData] = useState<RangeData | null>(null);
  const [showCSVPreview, setShowCSVPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calculatedLocally, setCalculatedLocally] = useState<boolean>(false);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      // Check using media query for touchscreens
      const isTouchDevice = window.matchMedia(
        "(hover: none) and (pointer: coarse)"
      ).matches;
      setIsMobile(isTouchDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Handle clicking outside to close tooltip on mobile only
  useEffect(() => {
    if (!isMobile) return; // Only add listener on mobile

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.tooltipIcon}`)) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile]);

  // Toggle tooltip function - only used on mobile
  const toggleTooltip = (id: string) => {
    if (!isMobile) return; // No-op on desktop - hover CSS handles it

    // If the same tooltip is clicked again, close it
    if (activeTooltip === id) {
      setActiveTooltip(null);
    } else {
      // Otherwise, open the new tooltip
      setActiveTooltip(id);
    }
  };

  const handleRangeFetch = useCallback(async () => {
    if (
      !rangeStart ||
      !rangeEnd ||
      isNaN(Number(rangeStart)) ||
      isNaN(Number(rangeEnd)) ||
      Number(rangeStart) <= 0 ||
      Number(rangeEnd) <= 0 ||
      Number(rangeStart) > Number(rangeEnd)
    ) {
      alert("Please enter a valid range of positive numbers (start ≤ end).");
      return;
    }

    const start = Number(rangeStart);
    const end = Number(rangeEnd);

    if (end - start > 2048) {
      alert(
        "Please limit your range to 2048 numbers at a time to prevent server overload."
      );
      return;
    }

    setIsLoading(true);
    try {
      const data = await getCollatzRangeData(start, end);
      setRangeData(data);

      const isLocal =
        end - start + 1 <= CLIENT_RANGE_CALCULATION_THRESHOLD &&
        end <= CLIENT_CALCULATION_THRESHOLD;
      setCalculatedLocally(isLocal);
    } catch (error) {
      console.error("Error fetching range data:", error);
      alert("Error fetching range data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [rangeStart, rangeEnd]);

  const handleDownloadCSV = useCallback(() => {
    if (!rangeData) return;
    const csvContent = generateCSV("range", rangeData);
    downloadCSV(
      csvContent,
      `collatz_range_${rangeData.range[0]}_to_${rangeData.range[1]}.csv`
    );
  }, [rangeData]);

  const handleDownloadJSON = useCallback(() => {
    if (!rangeData) return;
    const jsonContent = JSON.stringify(rangeData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `collatz_range_${rangeData.range[0]}_to_${rangeData.range[1]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [rangeData]);

  const handlePreviewCSV = useCallback(() => {
    if (!rangeData) return;
    const csvContent = generateCSV("range", rangeData);
    setShowCSVPreview(csvContent);
  }, [rangeData]);

  const handleDownloadSVG = useCallback(() => {
    if (!chartContainerRef.current) return;
    const svg = chartContainerRef.current.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `collatz_chart_${rangeData?.range[0]}_${rangeData?.range[1]}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [rangeData]);

  const totalNumbers = useMemo(() => {
    return rangeData ? rangeData.details.length : 0;
  }, [rangeData]);

  const avgSteps = useMemo(() => {
    if (!rangeData) return 0;
    const total = rangeData.details.reduce(
      (sum, item) => sum + item.iterations,
      0
    );
    return (total / rangeData.details.length).toFixed(2);
  }, [rangeData]);

  return (
    <div className={styles.dashboardCard}>
      <div className={styles.cardHeader}>
        <h2>Range Analysis</h2>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.inputSection}>
          <input
            type="number"
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
            min="1"
            className={styles.numberInput}
            placeholder="Start Number"
          />
          <input
            type="number"
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
            min="1"
            className={styles.numberInput}
            placeholder="End Number"
          />
          <button
            onClick={handleRangeFetch}
            className={styles.analyzeButton}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Analyze Range"}
          </button>
        </div>

        {rangeData && (
          <>
            {calculatedLocally && (
              <div className={styles.localCalcInfo}>
                Calculated locally for better performance. Ranges up to{" "}
                {CLIENT_RANGE_CALCULATION_THRESHOLD} are calculated client-side.
              </div>
            )}

            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Total Numbers
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("totalNumbers")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "totalNumbers"
                          ? styles.mobileVisible
                          : ""
                      }`}
                    >
                      Total number of integers analyzed in the selected range.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>{totalNumbers}</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Avg Steps
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("avgSteps")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "avgSteps" ? styles.mobileVisible : ""
                      }`}
                    >
                      Average number of steps needed to reach 1 across all
                      numbers in the range.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>{avgSteps}</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Max Steps (at)
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("maxSteps")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "maxSteps" ? styles.mobileVisible : ""
                      }`}
                    >
                      Highest number of steps needed to reach 1
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {rangeData.max_iterations.iterations} (at{" "}
                  {rangeData.max_iterations.number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Max Value
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("maxValue")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "maxValue" ? styles.mobileVisible : ""
                      }`}
                    >
                      Highest value reached by any number in the range during
                      its sequence.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {rangeData.max_value.value} (at {rangeData.max_value.number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Max Odd Steps
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("maxOddSteps")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "maxOddSteps"
                          ? styles.mobileVisible
                          : ""
                      }`}
                    >
                      Highest number of (3n+1)/2 operations (applied to odd
                      numbers).
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {rangeData.max_shortcut.count} (at{" "}
                  {rangeData.max_shortcut.number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Max Harmonic Sum
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("maxHarmonicSum")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "maxHarmonicSum"
                          ? styles.mobileVisible
                          : ""
                      }`}
                    >
                      Highest sum of reciprocals (∑1/n) for all numbers in a
                      sequence.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {rangeData.max_sum_values.sum.toFixed(2)} (at{" "}
                  {rangeData.max_sum_values.number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Max Growth
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("maxGrowth")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "maxGrowth"
                          ? styles.mobileVisible
                          : ""
                      }`}
                    >
                      Longest streak of consecutive increasing values
                      (consecutive 3 mod 4 number) in any sequence in the range.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {rangeData.max_grow_seq.value} (at{" "}
                  {rangeData.max_grow_seq.number})
                </div>
              </div>
            </div>

            <div className={styles.toggleSection}>
              <button
                onClick={() =>
                  setChartType(chartType === "bar" ? "line" : "bar")
                }
                className={styles.toggleChartButton}
              >
                Switch to {chartType === "bar" ? "Line" : "Bar"} Chart
              </button>
            </div>

            <div ref={chartContainerRef} className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={400}>
                {chartType === "bar" ? (
                  <BarChart data={rangeData.details}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="number" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="iterations" fill="#ff7300" />
                  </BarChart>
                ) : (
                  <LineChart data={rangeData.details}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="number" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="iterations"
                      stroke="#8884d8"
                      dot={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className={styles.downloadSection}>
              <button
                onClick={handleDownloadCSV}
                className={styles.analyzeButton}
              >
                Download CSV
              </button>
              <button
                onClick={handlePreviewCSV}
                className={styles.analyzeButton}
              >
                Preview CSV
              </button>
              <button
                onClick={handleDownloadJSON}
                className={styles.analyzeButton}
              >
                Download JSON
              </button>
              <button
                onClick={handleDownloadSVG}
                className={styles.analyzeButton}
              >
                Download SVG
              </button>
            </div>

            {showCSVPreview && (
              <div className={styles.csvPreview}>
                <pre>{showCSVPreview}</pre>
                <button
                  onClick={() => setShowCSVPreview(null)}
                  className={styles.closePreviewButton}
                >
                  Close Preview
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RangeCollatzAnalysis;
