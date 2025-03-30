"use client";

import React, { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import styles from "./ThreeDVis.module.scss";
import { MulData } from "./types";
import {
  fetchCollatzData,
  validateRange,
  MAX_RANGE_SIZE,
  createVisualizationScene,
} from "./ThreeDVisLogic";

/**
 * Enhanced Three.js scene that visualizes Collatz data in 3D orbital patterns
 */
export default function ThreeDVis() {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [data, setData] = useState<MulData[]>([]);
  const [range, setRange] = useState({ start: 3, end: 101 });
  const [inputValues, setInputValues] = useState({ start: "3", end: "101" });
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isMaxRange, setIsMaxRange] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Validate and update range
  const validateAndUpdateRange = (start: number, end: number) => {
    const {
      start: validStart,
      end: validEnd,
      isMaxRange,
    } = validateRange(start, end);

    // Update both the actual range and the input values
    setRange({ start: validStart, end: validEnd });
    setInputValues({ start: validStart.toString(), end: validEnd.toString() });
    setIsMaxRange(isMaxRange);
  };

  useEffect(() => {
    // Skip if we're not in client-side rendering
    if (!isClient) return;

    // Fetch or calculate the Collatz data
    const getCollatzData = async () => {
      setLoading(true);

      try {
        const collatzData = await fetchCollatzData(range.start, range.end);
        setData(collatzData);
      } catch (error) {
        console.error("Error getting Collatz data:", error);
      } finally {
        setLoading(false);
      }
    };

    getCollatzData();
  }, [range, isClient]);

  useEffect(() => {
    // Skip if there's no data or no mount ref or not client-side
    if (!data.length || !mountRef.current || !isClient) return;

    // Clear previous content
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    // Create visualization scene
    const { cleanup } = createVisualizationScene(mountRef.current, data);

    // Store cleanup function
    cleanupRef.current = cleanup;

    // Cleanup function for useEffect
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [data, isClient]);

  return (
    <div className={styles.ThreeDVisWrapper} id="threeDVis">
      <div className={styles.usageSection}>
        <div
          className={styles.usageHeader}
          onClick={() => setShowUsage((prev) => !prev)}
        >
          <h2 className={styles.ThreeDVisTitle}>3D Visualizer</h2>
          <button
            className={`${styles.toggleButton} ${showUsage ? styles.spin : ""}`}
            aria-label="Toggle the Description of the 3D tool"
          >
            <div className={styles.iconWrapper}>
              <FaChevronDown className={styles.icon} />
            </div>
          </button>
        </div>

        <div
          className={`${styles.usageContent} ${
            showUsage ? styles.open : styles.closed
          }`}
        >
          <p className={styles.ThreeDVisDescription}>
            This 3D visualization shows orbital patterns of odd numbers through
            the Collatz process. Each orbit represents a number, with its path
            shaped by division counts and odd-step patterns. Colors indicate
            special properties: orange for Mersenne-like numbers (2ⁿ-1), blue
            for 3 mod 4 numbers.
          </p>
          <ol className={styles.numberedList}>
            <li>
              <strong>Set the Number Range:</strong> Enter the starting and
              ending numbers to generate orbits for that range. Smaller ranges
              (e.g., 3–101) work best for clear visualization.
            </li>
            <li>
              <strong>Interact with the 3D Model:</strong> Click and drag to
              rotate the view, scroll to zoom in/out, and right-click to pan
              across the orbital patterns.
            </li>
            <li>
              <strong>Observe Color Patterns:</strong> Pay attention to how
              different colored paths (representing different types of numbers)
              behave in the 3D space.
            </li>
          </ol>
        </div>
      </div>

      {isClient && (
        <>
          <div className={styles.controls}>
            <label>
              Starting number:
              <input
                type="number"
                min="3"
                step="2"
                value={inputValues.start}
                onChange={(e) => {
                  setInputValues((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }));
                }}
                onBlur={() => {
                  const newStart = parseInt(inputValues.start) || 3;
                  validateAndUpdateRange(newStart, range.end);
                }}
              />
            </label>
            <label>
              Ending number:
              <input
                type="number"
                min="5"
                value={inputValues.end}
                onChange={(e) => {
                  setInputValues((prev) => ({ ...prev, end: e.target.value }));
                }}
                onBlur={() => {
                  const newEnd = parseInt(inputValues.end) || 101;
                  validateAndUpdateRange(range.start, newEnd);
                }}
              />
            </label>
            <button
              onClick={() => {
                validateAndUpdateRange(3, 101);
              }}
            >
              Reset Range
            </button>
          </div>

          {isMaxRange && (
            <div className={styles.rangeWarning}>
              Maximum range of {MAX_RANGE_SIZE} reached. Try a smaller range for
              better performance.
            </div>
          )}

          {loading ? (
            <div className={styles.loading}>Loading visualization...</div>
          ) : (
            <div className={styles.ThreeDVisContainer} ref={mountRef} />
          )}

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ backgroundColor: "#ff5722" }}
              ></span>
              <span>Mersenne-like numbers (2ⁿ-1)</span>
            </div>
            <div className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ backgroundColor: "#3b82f6" }}
              ></span>
              <span>Numbers ≡ 3 (mod 4)</span>
            </div>
            <div className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ backgroundColor: "#10b981" }}
              ></span>
              <span>Numbers ≡ 1 (mod 4)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
