"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SixNRange } from "./types";
import {
  get6NAnalysisData,
  generateCSV,
  downloadCSV,
  CLIENT_RANGE_CALCULATION_THRESHOLD,
  CLIENT_CALCULATION_THRESHOLD,
} from "./collatzUtils";
import styles from "./ChartAnalysis.module.scss";
import { FaQuestionCircle } from "react-icons/fa";

const SixNCollatzAnalysis: React.FC = () => {
  const [sixNStart, setSixNStart] = useState<string | number>("");
  const [sixNEnd, setSixNEnd] = useState<string | number>("");
  const [sixNData, setSixNData] = useState<SixNRange | null>(null);
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

  const calculate6NNumbers = useCallback(async () => {
    if (
      !sixNStart ||
      !sixNEnd ||
      isNaN(Number(sixNStart)) ||
      isNaN(Number(sixNEnd)) ||
      Number(sixNStart) <= 0 ||
      Number(sixNEnd) <= 0 ||
      Number(sixNStart) > Number(sixNEnd)
    ) {
      alert("Please enter a valid range of positive numbers (start ≤ end).");
      return;
    }

    const start = Number(sixNStart);
    const end = Number(sixNEnd);

    if (end - start > 2048) {
      alert(
        "Please limit your range to 2048 numbers at a time to prevent server overload."
      );
      return;
    }

    setIsLoading(true);
    try {
      const data = await get6NAnalysisData(start, end);
      setSixNData(data);

      const isLocal =
        end - start + 1 <= CLIENT_RANGE_CALCULATION_THRESHOLD &&
        end <= CLIENT_CALCULATION_THRESHOLD;
      setCalculatedLocally(isLocal);
    } catch (error) {
      console.error("Error fetching 6n±1 data:", error);
      alert("Error fetching 6n±1 data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [sixNStart, sixNEnd]);

  const handleDownloadCSV = useCallback(() => {
    if (!sixNData) return;
    const csvContent = generateCSV("sixN", sixNData);
    downloadCSV(
      csvContent,
      `collatz_6n_${sixNData.range[0]}_to_${sixNData.range[1]}.csv`
    );
  }, [sixNData]);

  const handlePreviewCSV = useCallback(() => {
    if (!sixNData) return;
    const csvContent = generateCSV("sixN", sixNData);
    setShowCSVPreview(csvContent);
  }, [sixNData]);

  const handleDownloadJSON = useCallback(() => {
    if (!sixNData) return;
    const jsonContent = JSON.stringify(sixNData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `collatz_6n_${sixNData.range[0]}_to_${sixNData.range[1]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sixNData]);

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
    link.download = `collatz_6n_chart_${sixNData?.range[0]}_${sixNData?.range[1]}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [sixNData]);

  return (
    <div className={styles.dashboardCard}>
      <div className={styles.cardHeader}>
        <h2>6n ± 1 Analysis</h2>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.inputSection}>
          <input
            type="number"
            value={sixNStart}
            onChange={(e) => setSixNStart(e.target.value)}
            min="1"
            className={styles.numberInput}
            placeholder="Start Number"
          />
          <input
            type="number"
            value={sixNEnd}
            onChange={(e) => setSixNEnd(e.target.value)}
            min="1"
            className={styles.numberInput}
            placeholder="End Number"
          />
          <button
            onClick={calculate6NNumbers}
            className={styles.analyzeButton}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Analyze 6n±1"}
          </button>
        </div>

        {sixNData && (
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
                      The number of values in the analyzed range.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {sixNData.stats.total_numbers}
                </div>
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
                <div className={styles.metricValue}>
                  {sixNData.stats.avg_iterations.toFixed(2)}
                </div>
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
                      Highest number of steps needed to reach 1 and which number
                      required it.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {sixNData.stats.max_iterations} (at{" "}
                  {sixNData.stats.max_iterations_number})
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
                  {sixNData.stats.max_value} (at{" "}
                  {sixNData.stats.max_value_number})
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
                      Highest count of (3n + 1) operations applied to odd
                      numbers in any sequence.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {sixNData.stats.max_shortcut} (at{" "}
                  {sixNData.stats.max_shortcut_number})
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
                  {sixNData.stats.max_sum.toFixed(2)} (at{" "}
                  {sixNData.stats.max_sum_number})
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
                      Longest streak of increasing values found in any sequence.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {sixNData.stats.max_grow_seq} (at{" "}
                  {sixNData.stats.max_grow_seq_number})
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
                  <BarChart data={sixNData.numbers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="number" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="iterations" fill="#ff7300" />
                  </BarChart>
                ) : (
                  <LineChart data={sixNData.numbers}>
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

export default SixNCollatzAnalysis;
