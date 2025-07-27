"use client";

import React from "react";
import ErrorBoundary from "../components/ThreeDVis/ErrorBoundary";

export default function TestUniversePage() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #0a0a2a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <ErrorBoundary>
        <div style={{ textAlign: 'center' }}>
          <h1>🌌 Collatz Universe Test</h1>
          <p>If you can see this, the error boundary is working correctly!</p>
          <p>The universe component should load without the DOM removal error.</p>
        </div>
      </ErrorBoundary>
    </div>
  );
} 