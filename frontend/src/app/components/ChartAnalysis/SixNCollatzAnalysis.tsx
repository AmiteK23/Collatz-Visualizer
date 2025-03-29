import React, { useState, useCallback, useRef } from "react";
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

const SixNCollatzAnalysis: React.FC = () => {
  const [sixNStart, setSixNStart] = useState<string | number>("");
  const [sixNEnd, setSixNEnd] = useState<string | number>("");
  const [sixNData, setSixNData] = useState<SixNRange | null>(null);
  const [showCSVPreview, setShowCSVPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [calculatedLocally, setCalculatedLocally] = useState<boolean>(false);
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  const chartContainerRef = useRef<HTMLDivElement | null>(null);

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
                <div className={styles.metricLabel}>Total Numbers</div>
                <div className={styles.metricValue}>
                  {sixNData.stats.total_numbers}
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Avg Steps</div>
                <div className={styles.metricValue}>
                  {sixNData.stats.avg_iterations.toFixed(2)}
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Steps (at)</div>
                <div className={styles.metricValue}>
                  {sixNData.stats.max_iterations} (at{" "}
                  {sixNData.stats.max_iterations_number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Value</div>
                <div className={styles.metricValue}>
                  {sixNData.stats.max_value} (at{" "}
                  {sixNData.stats.max_value_number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Odd Steps</div>
                <div className={styles.metricValue}>
                  {sixNData.stats.max_shortcut} (at{" "}
                  {sixNData.stats.max_shortcut_number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Sum</div>
                <div className={styles.metricValue}>
                  {sixNData.stats.max_sum.toFixed(2)} (at{" "}
                  {sixNData.stats.max_sum_number})
                </div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Max Growth</div>
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
