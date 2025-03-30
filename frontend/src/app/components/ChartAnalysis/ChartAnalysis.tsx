"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaChevronDown } from "react-icons/fa";
import styles from "./ChartAnalysis.module.scss";

const SingleCollatzAnalysis = dynamic(() => import("./SingleCollatzAnalysis"), {
  ssr: false,
});
const RangeCollatzAnalysis = dynamic(() => import("./RangeCollatzAnalysis"), {
  ssr: false,
});
const SixNCollatzAnalysis = dynamic(() => import("./SixNCollatzAnalysis"), {
  ssr: false,
});

const ChartAnalysis: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [descOpen, setDescOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className={styles.chartAnalysisWrapper}>
      <div className={styles.chartAnalysis} id="chartAnalysis">
        <div
          className={styles.usageHeader}
          onClick={() => setDescOpen(!descOpen)}
        >
          <h2 className={styles.chartAnalysisHeader}>Chart Analysis</h2>
          <button
            className={`${styles.toggleButton} ${descOpen ? styles.spin : ""}`}
            aria-label="Toggle the Description of the Chart Analysis tool"
          >
            <div className={styles.iconWrapper}>
              <FaChevronDown className={styles.icon} />
            </div>
          </button>
        </div>

        <div
          className={`${styles.usageContent} ${!descOpen ? styles.closed : ""}`}
        >
          <div className={styles.chartAnalysisDescription}>
            <p>
              This tool allows you to analyze and visualize the behavior of the{" "}
              <strong>Collatz sequence</strong> using interactive charts.
            </p>

            <ul>
              <li>
                Enter a <strong>single number</strong> to view its full sequence
                breakdown — steps, peak value, odd steps, closure point, and
                growth rate.
              </li>
              <li>
                Select a <strong>range</strong> of numbers to generate
                comparative line or bar charts.
              </li>
              <li>
                Use the <strong>6n ± 1 analysis</strong> to explore patterns in
                special odd-number subsets.
              </li>
            </ul>

            <p>Charts are interactive and exportable:</p>

            <ul>
              <li>
                <strong>CSV:</strong> For spreadsheet/data tools
              </li>
              <li>
                <strong>JSON:</strong> For APIs or coding use
              </li>
              <li>
                <strong>SVG:</strong> For scalable chart graphics
              </li>
            </ul>

            <p>
              Small inputs are processed instantly in the browser. Large ranges
              are computed on the server to maintain performance.
            </p>
          </div>
        </div>

        <SingleCollatzAnalysis />
        <RangeCollatzAnalysis />
        <SixNCollatzAnalysis />
      </div>
    </div>
  );
};

export default ChartAnalysis;
