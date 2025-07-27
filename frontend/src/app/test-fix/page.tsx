"use client";

import React, { useState } from "react";
import CollatzUniverse from "../components/ThreeDVis/CollatzUniverse";
import ErrorBoundary from "../components/ThreeDVis/ErrorBoundary";
import { MulData } from "../components/ThreeDVis/types";

export default function TestFixPage() {
  const [showUniverse, setShowUniverse] = useState(false);
  const [data] = useState<MulData[]>([
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
    }
  ]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #0a0a2a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1>🌌 DOM Cleanup Test</h1>
        <p>Testing the fixed DOM removal logic</p>
        
        <button 
          onClick={() => setShowUniverse(!showUniverse)}
          style={{
            padding: '12px 24px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          {showUniverse ? 'Hide Universe' : 'Show Universe'}
        </button>
        
        <p style={{ fontSize: '14px', opacity: 0.8 }}>
          Try toggling the universe multiple times to test DOM cleanup
        </p>
      </div>

      {showUniverse && (
        <div style={{ width: '100%', height: '80%' }}>
          <ErrorBoundary>
            <CollatzUniverse data={data} />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
} 