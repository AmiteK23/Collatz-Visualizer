"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
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

const RangeCollatzAnalysis: React.FC = () => {
  const [rangeStart, setRangeStart] = useState<string | number>("");
  const [rangeEnd, setRangeEnd] = useState<string | number>("");
  const [rangeData, setRangeData] = useState<RangeData | null>(null);
  const [showCSVPreview, setShowCSVPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calculatedLocally, setCalculatedLocally] = useState<boolean>(false);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const chartContainerRef = useRef<HTMLDivElement | null>(null);

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
                <div className={styles.metricLabel}>Total Numbers</div>
                <div className={styles.metricValue}>{totalNumbers}</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Avg Steps</div>
                <div className={styles.metricValue}>{avgSteps}</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Steps (at)</div>
                <div className={styles.metricValue}>
                  {rangeData.max_iterations.iterations} (at{" "}
                  {rangeData.max_iterations.number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Value</div>
                <div className={styles.metricValue}>
                  {rangeData.max_value.value} (at {rangeData.max_value.number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Odd Steps</div>
                <div className={styles.metricValue}>
                  {rangeData.max_shortcut.count} (at{" "}
                  {rangeData.max_shortcut.number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Sum</div>
                <div className={styles.metricValue}>
                  {rangeData.max_sum_values.sum.toFixed(2)} (at{" "}
                  {rangeData.max_sum_values.number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Growth</div>
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
