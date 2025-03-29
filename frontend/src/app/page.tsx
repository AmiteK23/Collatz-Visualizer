"use client";

import React, { useState, useEffect } from "react";
import Header from "./components/Header/Header";
import About from "./components/About/About";
import AdvancedCollatzDashboard from "./components/ChartAnalysis/ChartAnalysis";
import PalindromeMulVis from "./components/ThreeDVis/ThreeDVis";
import CollatzPowerRangeVis from "./components/PowerRangeVis/PowerRangeVis";
import Footer from "./components/Footer/Footer";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import styles from "./page.module.css"; // Add a fade transition wrapper
import PythonCodeSharing from "./components/PythonCodeSharing/PythonCodeSharing";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [fadeOutComplete, setFadeOutComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Simulated load time
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      const exitTimer = setTimeout(() => setFadeOutComplete(true), 1000); // Wait for fade
      return () => clearTimeout(exitTimer);
    }
  }, [loading]);

  if (!fadeOutComplete && loading) {
    return <LoadingScreen fadeOut={!loading} />;
  }

  return (
    <div className={styles.fadeInContent}>
      {/* Apply smooth fade-in transition */}
      <Header />
      <About />
      <PalindromeMulVis />
      <AdvancedCollatzDashboard />
      <CollatzPowerRangeVis />
      <PythonCodeSharing />
      <Footer />
    </div>
  );
}
