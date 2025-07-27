"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CollatzUniverse from "../components/ThreeDVis/CollatzUniverse";
import ErrorBoundary from "../components/ThreeDVis/ErrorBoundary";
import { MulData } from "../components/ThreeDVis/types";
import { calculateCollatzData } from "../components/ThreeDVis/ThreeDVisLogic";

export default function UniversePage() {
  const [data, setData] = useState<MulData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNumberInput, setShowNumberInput] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [inputLoading, setInputLoading] = useState(false);

  useEffect(() => {
    // Generate sample data for the universe
    const generateUniverseData = async () => {
      try {
        console.log('Starting data generation...');
        const universeData = calculateCollatzData(3, 201);
        console.log('Data generated:', universeData.length, 'items');
        setData(universeData);
        setLoading(false);
      } catch (error) {
        console.error('Error generating data:', error);
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
      console.log('Data generation timeout - using fallback');
      const fallbackData = [
        { n: 3, multiplyChain: [3, 10, 5, 16, 8, 4, 2, 1], finalEven: 16, divCount: 4, timesStayedOdd: 2 },
        { n: 5, multiplyChain: [5, 16, 8, 4, 2, 1], finalEven: 16, divCount: 4, timesStayedOdd: 1 },
        { n: 7, multiplyChain: [7, 22, 11, 34, 17, 52, 26, 13, 40, 20, 10, 5, 16, 8, 4, 2, 1], finalEven: 26, divCount: 1, timesStayedOdd: 3 }
      ];
      setData(fallbackData);
      setLoading(false);
    }, 5000); // 5 second timeout

    generateUniverseData();

    return () => clearTimeout(timeoutId);
  }, []);

  if (showNumberInput) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a4a 0%, #0a0a2a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>🔢 Enter Your Numbers</h3>
            <button 
              onClick={() => setShowNumberInput(false)}
              style={{
                background: 'rgba(255, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ color: 'white' }}>
            <p style={{ marginBottom: '20px', opacity: 0.9, lineHeight: 1.5 }}>
              Enter numbers to explore in the 3D Collatz Universe:
            </p>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#4a90e2' }}>
                Range (start - end):
              </label>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., 3-20"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                              <button 
                  onClick={async () => {
                    if (inputLoading) return; // Prevent multiple clicks
                  if (userInput.trim()) {
                    const range = userInput.split('-').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0);
                    if (range.length === 2 && range[0] <= range[1]) {
                      const [start, end] = range;
                      
                      // Validate range size (inclusive range)
                      const rangeSize = end - start + 1;
                      if (rangeSize > 1000) {
                        alert(`Please enter a smaller range (max 1000 numbers). Your range ${start}-${end} contains ${rangeSize} numbers.`);
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
                      } catch (error) {
                        console.error('Error generating data:', error);
                        // Fallback to minimal data
                        const fallbackData = [
                          { n: start, multiplyChain: [start, 3 * start + 1, 1], finalEven: 3 * start + 1, divCount: 1, timesStayedOdd: 1 }
                        ];
                        setData(fallbackData);
                        setInputLoading(false);
                      }
                    } else {
                      alert('Please enter a valid range (e.g., 3-20)');
                    }
                  } else {
                    alert('Please enter a range');
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(74, 144, 226, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                disabled={!userInput.trim() || inputLoading}
              >
                {inputLoading ? '⏳ Calculating...' : '🌌 Explore in 3D'}
              </button>
              <button 
                onClick={() => setShowNumberInput(false)}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <p>Loading Collatz Universe...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Back to Main Navigation */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        gap: '10px'
      }}>
        <Link 
          href="/"
          style={{
            padding: '10px 20px',
            background: 'rgba(74, 144, 226, 0.9)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = 'rgba(74, 144, 226, 1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.background = 'rgba(74, 144, 226, 0.9)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Main
        </Link>
        
        <button 
          onClick={() => setShowNumberInput(true)}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 193, 7, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'rgba(255, 193, 7, 1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.background = 'rgba(255, 193, 7, 0.8)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          🔢 Enter Numbers
        </button>
        

      </div>

      <ErrorBoundary>
        <CollatzUniverse data={data} />
      </ErrorBoundary>
    </div>
  );
} 