"use client";

import React, { useState } from "react";
import styles from "./PythonCodeSharing.module.scss";

// Content for scripts (ideally would be imported from separate files)
import { scriptContent, ScriptKey } from "./scriptsData";

interface ScriptFeature {
  id: number;
  text: string;
}

interface ScriptDescription {
  title: string;
  description: string;
  features: ScriptFeature[];
  compatibility: string;
}

interface ScriptDescriptions {
  [key: string]: ScriptDescription;
}

const scriptDescriptions: ScriptDescriptions = {
  "binary-analysis": {
    title: "Binary Analysis",
    description:
      "Analyzes Collatz sequences by computing consecutive odd steps using an optimized binary approach.",
    features: [
      {
        id: 1,
        text: "Efficiently computes Collatz sequences without iteration.",
      },
      { id: 2, text: "Visualizes distribution of consecutive odd steps (k)." },
      { id: 3, text: "Reports mismatches for accuracy verification." },
    ],
    compatibility: "Compatible with Python 3.7+ (matplotlib required).",
  },
  "ratio-analysis": {
    title: "Ratio Analysis",
    description:
      "Detailed analysis of odd-to-even step ratios in Collatz sequences, with trajectory visualizations.",
    features: [
      {
        id: 1,
        text: "Analyzes full Collatz trajectories or optimized patterns.",
      },
      {
        id: 2,
        text: "Visualizes odd/even step ratios and trajectory lengths.",
      },
      {
        id: 3,
        text: "Supports comparison of standard vs. shortcut Collatz methods.",
      },
    ],
    compatibility: "Compatible with Python 3.7+ (numpy, matplotlib required).",
  },
};

const PythonCodeSharing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ScriptKey>("binary-analysis");
  const [copied, setCopied] = useState(false);

  const downloadScript = (scriptName: string, content: string): void => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = scriptName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    const content = scriptContent[activeTab];
    navigator.clipboard.writeText(content.trim()); // trimmed to remove unwanted leading/trailing whitespace
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.codeContainer} id="analysisScripts">
      <h2 className={styles.title}>Analysis Scripts</h2>

      <div className={styles.tabContainer}>
        <div className={styles.tabHeader}>
          {Object.keys(scriptDescriptions).map((key) => (
            <button
              key={key}
              className={`${styles.tabButton} ${
                activeTab === key ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab(key as ScriptKey)}
            >
              {scriptDescriptions[key].title}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.infoPanel}>
        <h3 className={styles.scriptTitle}>
          {scriptDescriptions[activeTab].title}
        </h3>
        <p className={styles.scriptDescription}>
          {scriptDescriptions[activeTab].description}
        </p>

        <div className={styles.featureList}>
          <h4 className={styles.featureTitle}>Key Features:</h4>
          <ul>
            {scriptDescriptions[activeTab].features.map((feature) => (
              <li key={feature.id}>{feature.text}</li>
            ))}
          </ul>
        </div>

        <p className={styles.compatibilityNote}>
          {scriptDescriptions[activeTab].compatibility}
        </p>
      </div>

      <div className={styles.buttonsContainer}>
        <button
          className={styles.downloadButton}
          onClick={() =>
            downloadScript(
              `${activeTab.replace("-", "_")}.py`,
              scriptContent[activeTab]
            )
          }
        >
          <span className={styles.downloadIcon}>⇩</span> Download Script
        </button>

        <button className={styles.copyButton} onClick={handleCopy}>
          {copied ? "✅ Copied!" : "📋 Copy"}
        </button>
      </div>

      <div className={styles.codePreview}>
        <pre>
          <code>{scriptContent[activeTab]}</code>
        </pre>
      </div>

      <div className={styles.requirements}>
        <p>
          ✏️ Written and optimized by me after extensive research on Collatz
          sequences – enjoy exploring! ꝏ
        </p>
        <p>Requires Python 3.7+ and libraries: matplotlib, numpy.</p>
        <p>
          For visualization, ensure you&apos;re in a matplotlib-supported
          environment.
        </p>
      </div>
    </div>
  );
};

export default PythonCodeSharing;
