"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CollatzUniverse from "../ThreeDVis/CollatzUniverse";
import ErrorBoundary from "../ThreeDVis/ErrorBoundary";
import { MulData } from "../ThreeDVis/types";
import { calculateCollatzData } from "../ThreeDVis/ThreeDVisLogic";
import styles from "./UniverseSection.module.scss";

export default function UniverseSection() {
  const [data, setData] = useState<MulData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showNumberInput, setShowNumberInput] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [inputLoading, setInputLoading] = useState(false);

  // Smooth scroll function (same as header)
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    const href = e.currentTarget.href;
    const targetId = href.includes("#") ? href.split("#")[1] : null;

    if (targetId) {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70, // Adjust offset for header height
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    // Generate sample data for the universe
    const generateUniverseData = async () => {
      try {
        console.log('Starting universe data generation...');
        const universeData = calculateCollatzData(3, 101); // Smaller dataset for main page
        console.log('Universe data generated:', universeData.length, 'items');
        setData(universeData);
        setLoading(false);
      } catch (error) {
        console.error('Error generating universe data:', error);
        // Fallback to minimal data
        const fallbackData = [
          { n: 3, multiplyChain: [3, 10, 5, 16, 8, 4, 2, 1], finalEven: 16, divCount: 4, timesStayedOdd: 2 },
          { n: 5, multiplyChain: [5, 16, 8, 4, 2, 1], finalEven: 16, divCount: 4, timesStayedOdd: 1 },
          { n: 7, multiplyChain: [7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1], finalEven: 26, divCount: 1, timesStayedOdd: 3 }
        ];
        setData(fallbackData);
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Universe data generation timeout - using fallback');
      const fallbackData = [
        { n: 3, multiplyChain: [3, 10, 5, 16, 8, 4, 2, 1], finalEven: 16, divCount: 4, timesStayedOdd: 2 },
        { n: 5, multiplyChain: [5, 16, 8, 4, 2, 1], finalEven: 16, divCount: 4, timesStayedOdd: 1 },
        { n: 7, multiplyChain: [7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1], finalEven: 26, divCount: 1, timesStayedOdd: 3 }
      ];
      setData(fallbackData);
      setLoading(false);
    }, 3000); // 3 second timeout

    generateUniverseData();

    return () => clearTimeout(timeoutId);
  }, []);

  if (showFullscreen && !loading && data.length > 0) {
    return (
      <div className={styles.fullscreenOverlay}>
        <div className={styles.fullscreenControls}>
          <button 
            onClick={() => setShowFullscreen(false)}
            className={styles.closeButton}
          >
            ✕ Close Fullscreen
          </button>
          <Link href="/universe" className={styles.fullscreenLink}>
            🌌 Full Universe Experience
          </Link>
        </div>
        <div className={styles.fullscreenContainer}>
          <ErrorBoundary>
            <CollatzUniverse data={data} />
          </ErrorBoundary>
        </div>
      </div>
    );
  }

  if (showFullscreen && (loading || data.length === 0)) {
    return (
      <div className={styles.fullscreenOverlay}>
        <div className={styles.fullscreenControls}>
          <button 
            onClick={() => setShowFullscreen(false)}
            className={styles.closeButton}
          >
            ✕ Close Fullscreen
          </button>
        </div>
        <div className={styles.fullscreenContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading Universe for Fullscreen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showNumberInput) {
    return (
      <div className={styles.numberInputOverlay}>
        <div className={styles.numberInputModal}>
          <div className={styles.numberInputHeader}>
            <h3>🔢 Enter Your Numbers</h3>
            <button 
              onClick={() => setShowNumberInput(false)}
              className={styles.closeButton}
            >
              ✕
            </button>
          </div>
          
          <div className={styles.numberInputContent}>
            <p>Enter numbers to explore in the 3D Collatz Universe:</p>
            <div className={styles.inputGroup}>
              <label>Range (start - end):</label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., 3-20"
                className={styles.numberInput}
              />
            </div>
            
            <div className={styles.inputButtons}>
                                              <button 
                  onClick={async () => {
                    if (inputLoading) return; // Prevent multiple clicks
                    if (userInput.trim()) {
                      const range = userInput.split('-').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0);
                      if (range.length === 2 && range[0] <= range[1]) {
                        const [start, end] = range;
                        
                        // Validate range size
                        if (end - start > 1000) {
                          alert('Please enter a smaller range (max 1000 numbers) for better performance.');
                          return;
                        }
                        
                        setShowNumberInput(false);
                        setInputLoading(true);
                        
                        try {
                          // Use setTimeout to prevent UI blocking
                          const userData = await new Promise<MulData[]>((resolve) => {
                            setTimeout(() => {
                              try {
                                const data = calculateCollatzData(start, end);
                                resolve(data);
                              } catch (error) {
                                console.error('Error in calculation:', error);
                                // Fallback data
                                const fallbackData = [
                                  { n: start, multiplyChain: [start, 3 * start + 1, 1], finalEven: 3 * start + 1, divCount: 1, timesStayedOdd: 1 }
                                ];
                                resolve(fallbackData);
                              }
                            }, 100);
                          });
                          
                          setData(userData);
                          setInputLoading(false);
                          setShowFullscreen(true);
                        } catch (error) {
                          console.error('Error generating data:', error);
                          // Fallback to minimal data
                          const fallbackData = [
                            { n: start, multiplyChain: [start, 3 * start + 1, 1], finalEven: 3 * start + 1, divCount: 1, timesStayedOdd: 1 }
                          ];
                          setData(fallbackData);
                          setInputLoading(false);
                          setShowFullscreen(true);
                        }
                      } else {
                        alert('Please enter a valid range (e.g., 3-20)');
                      }
                    } else {
                      alert('Please enter a range');
                    }
                  }}
                  className={styles.exploreButton}
                  disabled={!userInput.trim() || inputLoading}
                >
                  {inputLoading ? '⏳ Calculating...' : '🌌 Explore in 3D'}
                </button>
              <button 
                onClick={() => setShowNumberInput(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="universe" className={styles.universeSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>🌌 Collatz Universe</h2>
          <p className={styles.description}>
            Immerse yourself in an interactive 3D exploration of the Collatz conjecture. 
            Experience mathematical patterns as never before in this immersive universe.
          </p>
        </div>

        <div className={styles.previewContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading Universe...</p>
            </div>
          ) : (
            <div className={styles.universePreview}>
              <ErrorBoundary>
                <CollatzUniverse data={data} />
              </ErrorBoundary>
              
              <div className={styles.previewOverlay}>
                <div className={styles.previewControls}>
                  <Link href="/universe" className={styles.exploreButton}>
                    🌌 Explore Full Universe
                  </Link>
                  <button 
                    onClick={() => setShowNumberInput(true)}
                    className={styles.numberInputButton}
                  >
                    🔢 Enter Numbers
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>🎯 Orbital Patterns</h3>
            <p>Watch numbers orbit in 3D space, revealing hidden mathematical relationships</p>
          </div>
          <div className={styles.feature}>
            <h3>📊 Sequence Flow</h3>
            <p>Follow the journey of numbers through their Collatz sequences</p>
          </div>
          <div className={styles.feature}>
            <h3>🔍 Pattern Analysis</h3>
            <p>Discover the underlying structures in the mathematical landscape</p>
          </div>
          <div className={styles.feature}>
            <h3>💡 Your Insights</h3>
            <p>Visualize your Collatz conjecture discoveries in immersive 3D</p>
          </div>
        </div>

        <div className={styles.learnMoreSection}>
          <h3 className={styles.learnMoreTitle}>📚 Learn More About the Collatz Conjecture</h3>
          
          <div className={styles.learnMoreContent}>
            <div className={styles.learnMoreCard}>
              <h4>🎯 What is the Collatz Conjecture?</h4>
              <p>
                The Collatz conjecture is a mathematical problem that asks whether a simple iterative process always reaches 1, 
                no matter which positive integer you start with. The process is defined as follows:
              </p>
              <ul>
                <li>If the number is even, divide it by 2</li>
                <li>If the number is odd, multiply it by 3 and add 1</li>
                <li>Repeat this process with the resulting number</li>
              </ul>
              <p>
                Despite its simple formulation, the conjecture remains unproven after decades of research, 
                making it one of mathematics' most intriguing open problems.
              </p>
            </div>

            <div className={styles.learnMoreCard}>
              <h4>🔬 Mathematical Insights</h4>
              <p>
                This 3D visualization reveals several fascinating patterns in Collatz sequences:
              </p>
              <ul>
                <li><strong>Mersenne-like numbers (2ⁿ-1):</strong> Require exactly n odd steps before reaching an even number</li>
                <li><strong>Numbers ≡ 1 (mod 4):</strong> Serve as "root" ancestors, transitioning to even numbers in a single odd step</li>
                <li><strong>Numbers ≡ 3 (mod 4):</strong> Can be reduced to their ancestors by applying (x-1)/2 repeatedly</li>
                <li><strong>Binary tree structure:</strong> Each ancestor generates an infinite tree of descendants</li>
              </ul>
            </div>

            <div className={styles.learnMoreCard}>
              <h4>🎮 How to Use This Universe</h4>
              <p>
                <strong>Interactive Controls:</strong>
              </p>
              <ul>
                <li><strong>Mouse:</strong> Click and drag to rotate, scroll to zoom, right-click to pan</li>
                <li><strong>Navigation:</strong> Use the menu to switch between different visualization modes</li>
                <li><strong>Custom Range:</strong> Click "Enter Numbers" to visualize your own range (e.g., "3-20")</li>
                <li><strong>Full Experience:</strong> Click "Explore Full Universe" for the complete immersive experience</li>
              </ul>
              <p>
                <strong>Color Coding:</strong> Different colors represent special number types and their mathematical properties.
              </p>
            </div>

            <div className={styles.learnMoreCard}>
              <h4>📖 Want to Dive Deeper?</h4>
              <p>
                Explore comprehensive documentation including detailed mathematical explanations, 
                research context, advanced usage instructions, and development status.
              </p>
              <Link href="/#about" className={styles.documentationLink} onClick={handleSmoothScroll}>
                📋 View Full Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 