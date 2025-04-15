"use client";
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import styles from "./Explanations.module.scss";

export default function Explanations() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  type TabType = "general" | "3d" | "chart" | "power" | "scripts";

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <>
      <button
        className={`${styles.toggleButton} ${isOpen ? styles.spin : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close explanations" : "Open explanations"}
      >
        <div className={styles.iconWrapper}>
          <FaChevronDown className={styles.icon} />
        </div>
      </button>

      <div
        className={`${styles.explanationsContainer} ${
          !isOpen ? styles.hidden : ""
        }`}
      >
        <div className={styles.explanationsContent}>
          <h3>Collatz Conjecture Visualizer</h3>

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "general" ? styles.activeTab : ""
              }`}
              onClick={() => handleTabChange("general")}
            >
              General
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "3d" ? styles.activeTab : ""
              }`}
              onClick={() => handleTabChange("3d")}
            >
              3D Orbits
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "chart" ? styles.activeTab : ""
              }`}
              onClick={() => handleTabChange("chart")}
            >
              Chart Analysis
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "power" ? styles.activeTab : ""
              }`}
              onClick={() => handleTabChange("power")}
            >
              Power Range
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "scripts" ? styles.activeTab : ""
              }`}
              onClick={() => handleTabChange("scripts")}
            >
              Analysis Scripts
            </button>
          </div>

          {activeTab === "general" && (
            <div className={styles.tabPanel}>
              <p>
                <strong>What is the Collatz Conjecture?</strong> For any
                positive integer n: if even, divide by 2; if odd, multiply by 3
                and add 1. The conjecture states this sequence always reaches 1.
              </p>
              <p>
                <strong>Steps/Iterations:</strong> Number of operations needed
                to reach 1. More iterations indicate more complex sequences.
              </p>
              <p>
                <strong>Max Value:</strong> Highest number reached in the
                sequence. Shows how far up the sequence goes before reaching 1.
              </p>
              <p>
                <strong>Odd Steps:</strong> Count of (3n+1)/2 operations (or
                1.5n + 0.5). More odd steps typically lead to longer sequences.
              </p>
              <p>
                <strong>Growth Rate:</strong> Percentage increase from start to
                max value. Indicates sequence volatility.
              </p>
              <p>
                <strong>Largest Growth:</strong> Longest streak of consecutive
                increases, showing sustained upward behavior.
              </p>
              <p>
                <strong>Closure Point:</strong> First power of 2 reached, or
                direct to power numbers (5, 21, 85, 341, etc). Charts display 5
                as the primary closure point.
              </p>
              <p>
                <strong>6n±1 Analysis:</strong> Numbers of the form 6n+1 or 6n-1
                often exhibit distinct structural behavior.
              </p>
            </div>
          )}

          {activeTab === "3d" && (
            <div className={styles.tabPanel}>
              <p>
                <strong>3D Orbital Visualization</strong> presents Collatz
                sequences as paths in 3D space.
              </p>
              <p>
                <strong>Color Coding:</strong> Orange = Mersenne-like (2ⁿ−1),
                Blue = 3 mod 4, Green = 1 mod 4.
              </p>
              <p>
                <strong>Navigation:</strong> Drag to rotate, scroll to zoom,
                right-click to pan.
              </p>
              <p>
                <strong>Number Range:</strong> Ideal for small ranges (e.g.
                3–101) to avoid clutter.
              </p>
              <p>
                <strong>Patterns:</strong> Reveals recurring shapes and symmetry
                across number classes.
              </p>
            </div>
          )}

          {activeTab === "chart" && (
            <div className={styles.tabPanel}>
              <p>
                <strong>Chart Analysis</strong> provides comprehensive
                visualizations of Collatz sequences through three different
                analysis modes:
              </p>

              <p>
                <strong>1. Single Number Analysis:</strong>
              </p>
              <ul>
                <li>
                  <strong>Input Number:</strong> Any positive integer you want
                  to analyze.
                </li>
                <li>
                  <strong>Steps/Iterations:</strong> Total operations to reach
                  1.
                </li>
                <li>
                  <strong>Odd Steps:</strong> Count of (3n+1)/2 operations.
                </li>
                <li>
                  <strong>Max Value:</strong> Highest number in the sequence.
                </li>
                <li>
                  <strong>Growth Rate:</strong> Percentage increase from start
                  to max value.
                </li>
                <li>
                  <strong>Largest Growth:</strong> Longest consecutive
                  increasing streak.
                </li>
                <li>
                  <strong>Harmonic Sum:</strong> The sum of the reciprocals
                  (∑ 1/n) of all values in the Collatz sequence for the selected
                  number.
                </li>

                <li>
                  <strong>Closure Point:</strong> First power of 2 or
                  direct-to-power number reached.
                </li>
                <li>
                  <strong>Chart:</strong> Toggle between line and bar
                  visualization of the full sequence.
                </li>
                <li>
                  <strong>Export Options:</strong> Download as CSV, JSON, or
                  SVG.
                </li>
                <br></br>
              </ul>

              <p>
                <strong>2. Range Analysis:</strong>
              </p>
              <ul>
                <li>
                  <strong>Range Selection:</strong> Analyze numbers between
                  start and end values (max 2048 range).
                </li>
                <li>
                  <strong>Total Numbers:</strong> Count of numbers analyzed.
                </li>
                <li>
                  <strong>Average Steps:</strong> Mean iterations across the
                  range.
                </li>
                <li>
                  <strong>Max Steps (at):</strong> Highest iteration count and
                  which number produced it.
                </li>
                <li>
                  <strong>Max Value:</strong> Largest value reached across all
                  sequences and its source number.
                </li>
                <li>
                  <strong>Max Odd Steps:</strong> Highest count of (3n+1)/2
                  operations and its source number.
                </li>
                <li>
                  <strong>Max Harmonic Sum:</strong> Largest value of ∑(1/n)
                  across all sequences and its source number.
                </li>

                <li>
                  <strong>Max Growth:</strong> Biggest growth streak and its
                  source number.
                </li>
                <li>
                  <strong>Chart:</strong> Visualize iterations per starting
                  number (bar or line).
                </li>
                <li>
                  <strong>Export Options:</strong> Download as CSV, JSON, or SVG
                  with preview capability.
                </li>
                <br></br>
              </ul>

              <p>
                <strong>3. 6n±1 Analysis:</strong>
              </p>
              <ul>
                <li>
                  <strong>Range Selection:</strong> Analyze numbers of form 6n±1
                  between start and end values.
                </li>
                <li>
                  <strong>Metrics:</strong> Same comprehensive metrics as Range
                  Analysis but focused on 6n±1 numbers.
                </li>
                <li>
                  <strong>Pattern Recognition:</strong> Identify structural
                  differences between 6n+1 and 6n-1 numbers.
                </li>
                <li>
                  <strong>Chart Comparison:</strong> Visualize iteration
                  patterns across the 6n±1 range.
                </li>
                <li>
                  <strong>Export Options:</strong> Same as Range Analysis for
                  data portability.
                </li>
                <br></br>
              </ul>

              <p>
                <strong>Performance Notes:</strong>
              </p>
              <ul>
                <li>
                  <strong>Local Calculation:</strong> Numbers below threshold
                  are calculated in-browser for faster performance.
                </li>
                <li>
                  <strong>Server Calculation:</strong> Larger numbers are
                  processed server-side for optimal performance.
                </li>
                <li>
                  <strong>Visualization:</strong> Toggle between bar and line
                  charts for different visual perspectives.
                </li>
                <br></br>
              </ul>

              <p>
                <strong>Interesting Numbers to Try:</strong> Powers of 2 (4, 8,
                16...), Mersenne-like (3, 7, 15...), or numbers of form 4k+1 or
                4k+3.
              </p>
            </div>
          )}

          {activeTab === "power" && (
            <div className={styles.tabPanel}>
              <p>
                <strong>Power Range Visualization</strong> shows Collatz paths
                for odd numbers in 2ⁿ–2ⁿ⁺¹ ranges.
              </p>
              <p>
                <strong>How to Read:</strong> X = step number, Y = sequence
                value. Each line = a unique starting number.
              </p>
              <p>
                <strong>Setting Powers:</strong> Input min/max powers (e.g. 4–7)
                to view 2⁴ to 2⁷–1.
              </p>
              <p>
                <strong>API vs Local:</strong> API = fast & async; Local =
                offline, slower for big ranges.
              </p>
              <p>
                <strong>Pattern Recognition:</strong> Compare behavior across
                ranges or odd/even patterns.
              </p>
              <p>
                <strong>Performance Tip:</strong> Use ranges like 2⁴ to 2⁷ for
                faster, smoother rendering.
              </p>
            </div>
          )}

          {activeTab === "scripts" && (
            <div className={styles.tabPanel}>
              <p>
                <strong>Analysis Scripts</strong> provide advanced tools for
                deeper exploration of Collatz patterns:
              </p>

              <p>
                <strong>Binary Analysis Script:</strong> Efficiently detects
                consecutive odd steps using binary methods.
              </p>
              <ul>
                <li>
                  Uses bit-level operations to identify consecutive odd steps
                  without computing full sequences
                </li>
                <li>
                  Employs trailing-zero counting for rapid pattern
                  identification in large ranges
                </li>
                <li>
                  Calculates the distribution of consecutive odd steps (k
                  values) across millions of numbers
                </li>
                <li>
                  Implements the optimized (3n+1)/2 approach for odd numbers
                </li>
                <li>
                  Provides visualizations of k-value distributions with
                  statistical analysis
                </li>
              </ul>

              <p>
                <strong>Ratio Analysis Script:</strong> Studies the ratio
                between odd and even steps in Collatz trajectories.
              </p>
              <ul>
                <li>
                  Compares standard 3n+1 vs. (3n+1)/2 shortcut calculation
                  methods
                </li>
                <li>
                  Analyzes odd/even step ratios across different starting
                  numbers
                </li>
                <li>
                  Tracks consecutive odd and even step patterns throughout
                  sequences
                </li>
                <li>
                  Generates multiple visualization types: ratio distribution,
                  trajectory scatter plots, k-distribution
                </li>
                <li>
                  Calculates statistical measures including average, median, and
                  maximum ratios
                </li>
                <li>
                  Allows comparison of specific numbers with detailed trajectory
                  analysis
                </li>
              </ul>

              <p>
                <strong>Technical Details:</strong>
              </p>
              <ul>
                <li>
                  Scripts written in Python 3.7+ with matplotlib and numpy
                  dependencies
                </li>
                <li>Optimized for performance on large number ranges</li>
                <li>
                  Interactive visualization features for exploring patterns
                </li>
                <li>
                  Compatible with most Python environments that support
                  matplotlib
                </li>
                <li>
                  Includes parameterized functions for customizing analysis
                  ranges
                </li>
              </ul>

              <p>
                These scripts are available for download in the{" "}
                <strong>Analysis Scripts</strong> section. They offer powerful
                tools for researchers and enthusiasts interested in exploring
                the mathematical structures within Collatz sequences.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
