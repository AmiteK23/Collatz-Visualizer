"use client";

import React, { useState, useEffect } from "react";
import CollatzUniverseDebug from "../components/ThreeDVis/CollatzUniverseDebug";
import ErrorBoundary from "../components/ThreeDVis/ErrorBoundary";
import { MulData } from "../components/ThreeDVis/types";

export default function DebugUniversePage() {
  const [data, setData] = useState<MulData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use hardcoded data for testing
    const testData: MulData[] = [
      {
        n: 3,
        multiplyChain: [3, 10, 5, 16, 8, 4, 2, 1],
        finalEven: 16,
        divCount: 4,
        timesStayedOdd: 2
      },
      {
        n: 5,
        multiplyChain: [5, 16, 8, 4, 2, 1],
        finalEven: 16,
        divCount: 4,
        timesStayedOdd: 1
      },
      {
        n: 7,
        multiplyChain: [7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1],
        finalEven: 26,
        divCount: 1,
        timesStayedOdd: 3
      }
    ];

    console.log('Setting debug test data:', testData.length, 'items');
    setData(testData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #0a0a2a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #4a90e2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading Debug Universe...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ErrorBoundary>
        <CollatzUniverseDebug data={data} />
      </ErrorBoundary>
    </div>
  );
} 