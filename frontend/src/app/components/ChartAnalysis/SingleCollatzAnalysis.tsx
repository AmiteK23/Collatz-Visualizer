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
import { CollatzData } from "./types";
import {
  getCollatzData,
  generateCSV,
  downloadCSV,
  CLIENT_CALCULATION_THRESHOLD,
} from "./collatzUtils";
import styles from "./ChartAnalysis.module.scss";
import { FaQuestionCircle } from "react-icons/fa";

const SingleCollatzAnalysis: React.FC = () => {
  const [inputNumber, setInputNumber] = useState<string | number>("15");
  const [singleData, setSingleData] = useState<CollatzData | null>(null);
  const [showCSVPreview, setShowCSVPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calculatedLocally, setCalculatedLocally] = useState<boolean>(false);
  const [chartType, setChartType] = useState<"bar" | "line">("line");
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
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  const handleSingleFetch = useCallback(async () => {
    if (
      !inputNumber ||
      isNaN(Number(inputNumber)) ||
      Number(inputNumber) <= 0
    ) {
      alert("Please enter a positive number.");
      return;
    }

    setIsLoading(true);
    try {
      const number = Number(inputNumber);
      const result = await getCollatzData(number);
      setSingleData(result);
      setCalculatedLocally(number <= CLIENT_CALCULATION_THRESHOLD);
    } catch (error) {
      console.error("Error fetching single number data:", error);
      alert("Error fetching data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [inputNumber]);

  const handleDownloadCSV = useCallback(() => {
    if (!singleData) return;
    const csvContent = generateCSV("single", singleData);
    downloadCSV(csvContent, `collatz_${singleData.number}.csv`);
  }, [singleData]);

  const handleDownloadJSON = useCallback(() => {
    if (!singleData) return;
    const jsonContent = JSON.stringify(singleData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `collatz_${singleData.number}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [singleData]);

  const handlePreviewCSV = useCallback(() => {
    if (!singleData) return;
    const csvContent = generateCSV("single", singleData);
    setShowCSVPreview(csvContent);
  }, [singleData]);

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
    link.download = `collatz_chart_${singleData?.number}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [singleData]);

  const sequenceSum = singleData ? singleData.sum_values.toFixed(2) : null;

  return (
    <div className={styles.dashboardCard}>
      <div className={styles.cardHeader}>
        <h2>Single Number Analysis</h2>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.inputSection}>
          <input
            type="number"
            value={inputNumber}
            onChange={(e) => setInputNumber(e.target.value)}
            min="1"
            className={styles.numberInput}
            placeholder="Enter a number"
          />
          <button
            onClick={handleSingleFetch}
            className={styles.analyzeButton}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Analyze"}
          </button>
        </div>

        {singleData && (
          <>
            {calculatedLocally && (
              <div className={styles.localCalcInfo}>
                Calculated locally for better performance. Numbers up to{" "}
                {CLIENT_CALCULATION_THRESHOLD} are calculated client-side.
              </div>
            )}

            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Steps
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("steps")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "steps" ? styles.mobileVisible : ""
                      }`}
                    >
                      Total number of operations until the sequence reaches 1.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {singleData.iterations}
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Odd Steps
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("oddSteps")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "oddSteps" ? styles.mobileVisible : ""
                      }`}
                    >
                      Number of (3n + 1) / 2 operations applied to odd numbers.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {singleData.shortcut_count}
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
                      Highest number reached during the sequence.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>{singleData.max_value}</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Growth Rate
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("growthRate")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "growthRate"
                          ? styles.mobileVisible
                          : ""
                      }`}
                    >
                      How much the sequence grows relative to the starting
                      number.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {((singleData.max_value / singleData.number) * 100).toFixed(
                    2
                  )}
                  %
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Largest Growth
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("largestGrowth")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "largestGrowth"
                          ? styles.mobileVisible
                          : ""
                      }`}
                    >
                      Longest streak of increasing values in the sequence.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {singleData.largest_grow_seq}
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Harmonic Sum
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("harmonicSum")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "harmonicSum"
                          ? styles.mobileVisible
                          : ""
                      }`}
                    >
                      Sum of reciprocals (∑1/n) for all numbers in the sequence.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>{sequenceSum}</div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>
                  Closure Point
                  <span
                    className={styles.tooltipIcon}
                    onClick={() => toggleTooltip("closurePoint")}
                  >
                    <FaQuestionCircle />
                    <span
                      className={`${styles.tooltipText} ${
                        activeTooltip === "closurePoint"
                          ? styles.mobileVisible
                          : ""
                      }`}
                    >
                      First power of 2 or special number the sequence settles
                      into.
                    </span>
                  </span>
                </div>
                <div className={styles.metricValue}>
                  {singleData.closure_point || "N/A"}
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
                  <BarChart
                    data={singleData.sequence.map((value, index) => ({
                      step: index,
                      value,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff7300" />
                  </BarChart>
                ) : (
                  <LineChart
                    data={singleData.sequence.map((value, index) => ({
                      step: index,
                      value,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
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

export default SingleCollatzAnalysis;
