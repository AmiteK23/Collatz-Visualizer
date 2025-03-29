"use client";
import React, { useState, useEffect } from "react";
import styles from "./About.module.scss";

const AboutPage: React.FC = () => {
  // Add mounted state to prevent hydration issues
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedAccordions, setExpandedAccordions] = useState<
    Record<string, boolean>
  >({
    notation: false,
    behavior: false,
    research: false,
  });

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleAccordion = (accordionId: string) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [accordionId]: !prev[accordionId],
    }));
  };

  // Prevent hydration issues by rendering only on client
  if (!mounted) {
    return <div className={styles.loading}>Loading about page...</div>;
  }

  return (
    <div className={styles.aboutContainer} id="about">
      <h1 className={styles.aboutTitle}>
        About the Collatz Conjecture Visualization Tool
      </h1>

      <div className={styles.devNotice}>
        <h3>🚧 Development Status</h3>
        <p>
          This website is currently under active development. Some features may
          not be fully optimized or could behave unexpectedly. Visualization
          performance for larger ranges is still being improved.
        </p>
        <p>
          The optimization features (sampling, pagination, and filtering) are in
          development, and you may experience performance issues with large data
          sets.
        </p>
      </div>

      <div className={styles.introPanel}>
        <p>
          This interactive tool visualizes the Collatz conjecture, one of the
          most famous unsolved problems in mathematics. My visualizations help
          you explore patterns in the Collatz sequences and gain intuition about
          this fascinating mathematical puzzle.
        </p>
        <p>
          Techs used: React, Next, TypeScript, Three.js, Recharts, Scss and
          Flask.
        </p>
      </div>

      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          <button
            type="button"
            className={`${styles.tabButton} ${
              activeTab === "overview" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabClick("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${
              activeTab === "visualizations" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabClick("visualizations")}
          >
            Visualizations
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${
              activeTab === "mathematics" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabClick("mathematics")}
          >
            Mathematics
          </button>
          <button
            type="button"
            className={`${styles.tabButton} ${
              activeTab === "usage" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabClick("usage")}
          >
            How to Use
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "overview" && (
            <div>
              <h2 className={styles.sectionTitle}>
                What is the Collatz Conjecture?
              </h2>
              <p>
                The Collatz conjecture is a mathematical problem that asks
                whether a simple iterative process always reaches 1, no matter
                which positive integer you start with.
              </p>
              <p>The process is defined as follows:</p>
              <ul className={styles.bulletList}>
                <li>If the number is even, divide it by 2</li>
                <li>If the number is odd, multiply it by 3 and add 1</li>
                <li>Repeat this process with the resulting number</li>
              </ul>
              <p>
                Despite its simple formulation, the conjecture remains unproven
                after decades of research, making it one of mathematics&apos;
                most intriguing open problems.
              </p>
              <p>
                My tool uses an equivalent form of the rule for odd numbers:
                3x+1, followed by division by 2, which simplifies to the
                (3x+1)/2 or 1.5x+0.5 notation seen in my visualizations.
              </p>
            </div>
          )}

          {activeTab === "visualizations" && (
            <div>
              <h2 className={styles.sectionTitle}>
                My Visualization Approaches
              </h2>

              <div className={styles.visualizationSection}>
                <h3 className={styles.subsectionTitle}>
                  1. 3D Orbital Visualization
                </h3>
                <p>
                  The 3D visualization displays Collatz sequences as orbital
                  paths in three-dimensional space, highlighting palindrome-like
                  patterns and special properties of certain numbers.
                </p>
                <p>Different colors indicate special number types:</p>
                <ul className={styles.bulletList}>
                  <li>Orange paths: Mersenne-like numbers (2^n-1)</li>
                  <li>Blue paths: Numbers ≡ 3 (mod 4)</li>
                  <li>Green paths: Numbers ≡ 1 (mod 4)</li>
                </ul>
                <p>
                  This visualization helps reveal structural patterns that are
                  harder to see in 2D representations.
                </p>
              </div>

              <div className={styles.usageSection}>
                <h3 className={styles.subsectionTitle}>2. Chart Analysis</h3>
                <ol className={styles.numberedList}>
                  <li>
                    <strong>Enter Your Input:</strong> Provide a single number,
                    a custom numeric range, or use 6n±1 ranges to analyze
                    interesting subsets of Collatz sequences.
                  </li>
                  <li>
                    <strong>Interactive Chart Display:</strong> Visualize the
                    complete path each number takes before reaching 1. The chart
                    highlights steps, sudden jumps, and recurring patterns,
                    offering visual clarity on sequence complexity.
                  </li>
                  <li>
                    <strong>Key Metrics and Statistics:</strong> Instantly view
                    critical statistics such as the maximum height (peak value),
                    stopping time (steps to reach 1), total trajectory length,
                    and average values for ranges.
                  </li>
                  <li>
                    <strong>Zoom & Focus:</strong> Use zoom and pan controls to
                    focus on specific segments of complex sequences for in-depth
                    observation.
                  </li>
                  {/* To be implemented: */}
                  {/* <li>
      <strong>Compare Multiple Sequences:</strong> In future updates, users will be able to input multiple numbers and compare their Collatz paths side by side, identifying common structures and outliers.
    </li> */}
                  <li>
                    <strong>Data Export Capabilities:</strong> Export
                    visualization data in multiple industry-standard formats
                    (CSV, JSON) for advanced analysis, documentation, or
                    integration with external systems. Vector graphic export
                    (SVG) is also available for high-quality publication and
                    presentation purposes.
                  </li>
                </ol>
              </div>

              <div className={styles.visualizationSection}>
                <h3 className={styles.subsectionTitle}>
                  3. Power Range Visualization
                </h3>
                <p>
                  This visualization shows Collatz sequences for odd numbers
                  grouped by powers of 2. Each line represents a different
                  starting number, with the x-axis showing the step number and
                  the y-axis showing the value at that step.
                </p>
                <p>
                  The Power Range tool helps identify patterns in how numbers
                  behave when they start in specific ranges like 2^4 to 2^5
                  (16-31), which often exhibit similar trajectory patterns.
                </p>
              </div>
            </div>
          )}

          {activeTab === "mathematics" && (
            <div>
              <h2 className={styles.sectionTitle}>Mathematical Details</h2>

              <div className={styles.accordion}>
                <div className={styles.accordionItem}>
                  <button
                    type="button"
                    className={styles.accordionTrigger}
                    onClick={() => toggleAccordion("notation")}
                  >
                    <span>Notation Used</span>
                    <span className={styles.accordionIcon}>
                      {expandedAccordions.notation ? "−" : "+"}
                    </span>
                  </button>

                  {expandedAccordions.notation && (
                    <div className={styles.accordionContent}>
                      <p>
                        My visualizations use the 1.5n + 0.5 notation for odd
                        numbers, which is equivalent to the standard 3n+1
                        followed by division by 2.
                      </p>
                      <p>
                        For odd numbers n, applying 3n+1 always produces an even
                        number. So we can combine the 3n+1 step with a division
                        by 2, giving us (3n+1)/2, which simplifies to 1.5n +
                        0.5.
                      </p>
                      <p>
                        This notation is more efficient for computation and
                        visualization, as it reduces the total number of steps
                        and avoids the &quot;bouncing&quot; behavior seen in the
                        standard notation.
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.accordionItem}>
                  <button
                    type="button"
                    className={styles.accordionTrigger}
                    onClick={() => toggleAccordion("behavior")}
                  >
                    <span>Behavioral Patterns</span>
                    <span className={styles.accordionIcon}>
                      {expandedAccordions.behavior ? "−" : "+"}
                    </span>
                  </button>

                  {expandedAccordions.behavior && (
                    <div className={styles.accordionContent}>
                      <p>
                        Several formal structural properties arise in Collatz
                        sequences:
                      </p>
                      <ul className={styles.bulletList}>
                        <li>
                          Numbers of the form <code>2^n - 1</code> require
                          exactly <code>n</code> odd steps before reaching an
                          even number
                        </li>
                        <li>
                          Odd numbers congruent to <code>1 mod 4</code> serve as
                          &quot;root&quot; ancestors; each transitions to an
                          even number in a single odd step
                        </li>
                        <li>
                          Each ancestor number generates an infinite binary tree
                          where each descendant is formed by repeatedly applying{" "}
                          <code>2x + 1</code>, with each generation increasing
                          the odd-step count by exactly one
                        </li>
                        <li>
                          Any number congruent to <code>3 mod 4</code> can be
                          reduced to its ancestor by repeatedly applying the
                          reverse mapping <code>(x - 1) / 2</code> until
                          reaching a <code>1 mod 4</code> number
                        </li>
                        <li>
                          The function <code>F(n)</code>, measuring the number
                          of odd steps from a <code>3 mod 4</code> number until
                          it transitions into a <code>1 mod 4</code> number, is
                          bounded by <code>⌊log₂(n)⌋</code> and attains equality
                          for numbers of the form <code>2^n - 1</code>
                        </li>
                      </ul>
                      <p>
                        This framework allows hierarchical visualization of
                        Collatz trajectories and structural tracing of numbers
                        back to their unique ancestral lines.
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.accordionItem}>
                  <button
                    type="button"
                    className={styles.accordionTrigger}
                    onClick={() => toggleAccordion("research")}
                  >
                    <span>Research Context</span>
                    <span className={styles.accordionIcon}>
                      {expandedAccordions.research ? "−" : "+"}
                    </span>
                  </button>

                  {expandedAccordions.research && (
                    <div className={styles.accordionContent}>
                      <p>
                        The Collatz conjecture has been verified for all
                        starting numbers up to 2^68 (approximately 2.95 ×
                        10^20), yet remains unproven in general.
                      </p>
                      <p>Key research areas include:</p>
                      <ul className={styles.bulletList}>
                        <li>
                          Statistical approaches to understand the
                          &quot;typical&quot; behavior
                        </li>
                        <li>
                          Connections to dynamical systems and ergodic theory
                        </li>
                        <li>
                          Computational verification for larger and larger
                          numbers
                        </li>
                        <li>
                          Special cases and related modifications of the problem
                        </li>
                      </ul>
                      <p>
                        Visualization tools like this help researchers and
                        enthusiasts develop intuition and identify patterns that
                        might contribute to a full proof.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "usage" && (
            <div>
              <h2 className={styles.sectionTitle}>How to Use This Tool</h2>

              <div className={styles.usageSection}>
                <h3 className={styles.subsectionTitle}>
                  3D Orbital Visualization
                </h3>
                <ol className={styles.numberedList}>
                  <li>
                    <strong>Set the Number Range:</strong> Enter the starting
                    and ending numbers to generate orbits for that range.
                    Smaller ranges (e.g., 3-101) work best for clear
                    visualization.
                  </li>
                  <li>
                    <strong>Interact with the 3D Model:</strong> Click and drag
                    to rotate the view, scroll to zoom in/out, and right-click
                    to pan across the orbital patterns.
                  </li>
                  <li>
                    <strong>Observe Color Patterns:</strong> Pay attention to
                    how different colored paths (representing different types of
                    numbers) behave in the 3D space.
                  </li>
                </ol>
              </div>

              <div className={styles.usageSection}>
                <h3 className={styles.subsectionTitle}>Chart Analysis</h3>
                <ol className={styles.numberedList}>
                  <li>
                    <strong>Input Options:</strong> Enter a single number, a
                    custom range, or a range defined by 6n+1/6n-1 forms to
                    explore different behavior patterns.
                  </li>
                  <li>
                    <strong>Detailed Path Visualization:</strong> The chart will
                    display the entire Collatz path for your input(s),
                    showcasing jumps, peaks, and loops.
                  </li>
                  <li>
                    <strong>Statistical Insights:</strong> View calculated
                    statistics such as maximum height, stopping time, and total
                    steps for each number.
                  </li>
                  {/* To be implemented: */}
                  {/* <li>
      <strong>Compare Multiple Numbers:</strong> Add multiple numbers to compare their paths side by side.
    </li> */}
                  <li>
                    <strong>Data Export Capabilities:</strong> Export
                    visualization data in multiple industry-standard formats
                    (CSV, JSON) for advanced analysis, documentation, or
                    integration with external systems. Vector graphic export
                    (SVG) is also available for high-quality publication and
                    presentation purposes.
                  </li>
                </ol>
              </div>

              <div className={styles.usageSection}>
                <h3 className={styles.subsectionTitle}>
                  Power Range Visualization
                </h3>
                <ol className={styles.numberedList}>
                  <li>
                    <strong>Set the Power Range:</strong> Enter the minimum and
                    maximum powers of 2 you wish to visualize. For example, a
                    range of 4-7 will visualize numbers from 2^4 (16) through
                    2^7-1 (127).
                  </li>
                  {/* To be implemented: */}
                  {/* <li>
                    <strong>Toggle Sampling:</strong> For larger ranges, turn
                    sampling on to improve performance while still showing
                    representative patterns.
                  </li> */}
                  <li>
                    <strong>Switch Data Source:</strong> Choose between using
                    the API or local calculation. API data may be faster for
                    complex ranges but requires a connection to the server.
                  </li>
                  {/* To be implemented: */}
                  {/* <li>
                    <strong>Filter Lines:</strong> Use the line filtering
                    options to show only specific subsets of numbers, making the
                    visualization easier to interpret.
                  </li> */}
                  <li>
                    <strong>Toggle Legend:</strong> Show or hide the legend to
                    identify specific starting numbers and their corresponding
                    paths.
                  </li>
                </ol>
              </div>

              <div className={styles.usageSection}>
                <h3 className={styles.subsectionTitle}>Performance Tips</h3>
                <ul className={styles.bulletList}>
                  {/* To be implemented: */}
                  {/* <li>
                    For large ranges, enable the sampling option to improve
                    performance
                  </li> */}
                  {/* To be implemented: */}
                  {/* <li> 
                    If the charts become too crowded, use the &quot;Show Every Nth&quot;
                    buttons to filter the data
                  </li> */}
                  <li>
                    Consider switching between API and Local Calculations to see
                    what works best.
                  </li>
                  <li>
                    For larger number ranges (above 2^8), you may experience
                    long loading times or server timeout errors while I improve
                    optimization (currently available up to 2^10).
                  </li>
                </ul>
              </div>

              <div className={styles.developmentNotice}>
                {" "}
                {/* inside How to use */}
                <h3 className={styles.subsectionTitle}>Development Status</h3>
                <p>
                  This visualization tool is still in active development.
                  Upcoming features include:
                </p>
                <ul className={styles.bulletList}>
                  <li>
                    Data sampling for more efficient visualization of large
                    ranges
                  </li>
                  <li>Progressive loading for improved user experience</li>
                  <li>
                    Line filtering options to show only specific numbers of
                    interest
                  </li>
                  <li>
                    Performance optimizations for handling larger datasets
                  </li>
                  <li>
                    Additional visualization styles and comparative analysis
                    tools
                  </li>
                </ul>
                <p>
                  I appreciate your patience and feedback as I continue to
                  improve this tool.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
