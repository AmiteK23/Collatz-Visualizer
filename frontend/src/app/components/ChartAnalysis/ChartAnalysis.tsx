"use client";

import React, { useState, useEffect } from "react";
import SingleCollatzAnalysis from "./SingleCollatzAnalysis";
import RangeCollatzAnalysis from "./RangeCollatzAnalysis";
import SixNCollatzAnalysis from "./SixNCollatzAnalysis";
import styles from "./ChartAnalysis.module.scss";

const ChartAnalysis: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className={styles.chartAnalysis} id="chartAnalysis">
      <h1 className={styles.chartAnalysisHeader}>Chart Analysis</h1>
      <p className={styles.chartAnalysisDescription}>
        Below is a tool that helps visualizing a specific number or range
      </p>

      <SingleCollatzAnalysis />
      <RangeCollatzAnalysis />
      <SixNCollatzAnalysis />
    </div>
  );
};

export default ChartAnalysis;
