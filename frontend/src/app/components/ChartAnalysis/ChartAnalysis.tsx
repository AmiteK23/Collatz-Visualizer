"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
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
