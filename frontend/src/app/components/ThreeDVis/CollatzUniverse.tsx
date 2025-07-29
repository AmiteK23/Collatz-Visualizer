"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MulData } from "./types";
import styles from "./ThreeDVis.module.scss";

interface CollatzUniverseProps {
  data: MulData[];
  onNavigate?: (section: string) => void;
}

/**
 * Immersive 3D Collatz Universe - Robust React + Three.js integration
 */
export default function CollatzUniverse({ data }: CollatzUniverseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  const isInitializedRef = useRef(false);
  const [currentSection, setCurrentSection] = useState("orbits");
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
    return () => {
      // Cleanup animation frame on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Cleanup function that safely disposes of Three.js resources
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }

    if (sceneRef.current) {
      try {
        // Dispose of Three.js resources
        if (sceneRef.current.renderer) {
          sceneRef.current.renderer.dispose();
        }
        if (sceneRef.current.controls) {
          sceneRef.current.controls.dispose();
        }
        
        // Clear the container more safely
        const container = containerRef.current;
        if (container) {
          // Remove all children except loading overlay
          const children = Array.from(container.children);
          children.forEach(child => {
            if (!child.classList.contains(styles.loadingOverlay)) {
              try {
                container.removeChild(child);
              } catch (error) {
                console.warn('Safe cleanup: child already removed', error);
              }
            }
          });
        }
        
        sceneRef.current = null;
      } catch (error) {
        console.warn('Error during Three.js cleanup:', error);
      }
    }
    
    isInitializedRef.current = false;
  }, []);

  // Initialize Three.js scene
  const initializeScene = useCallback(async () => {
    if (!containerRef.current || !data.length || !isClient || isInitializedRef.current) {
      return;
    }

    try {
      console.log('Initializing Three.js scene...');
      
      // Clean up any existing scene first
      cleanup();
      
      // Dynamic import of Three.js
      const THREE = await import('three');
      
      // Try to import OrbitControls with fallback
      let OrbitControls;
      try {
        const controlsModule = await import('three/examples/jsm/controls/OrbitControls.js');
        OrbitControls = controlsModule.OrbitControls;
      } catch (error) {
        console.warn('Could not load OrbitControls, using basic camera controls');
        OrbitControls = null;
      }
      
      const container = containerRef.current;
      if (!container) return;

      // Get container dimensions
      const rect = container.getBoundingClientRect();
      const width = rect.width || 800;
      const height = rect.height || 600;

      // Create canvas element
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
      camera.position.set(0, 50, 100);

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: false
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(50, 50, 50);
      scene.add(directionalLight);

      // Add starfield background
      const starfield = createStarfield(THREE);
      scene.add(starfield);

      // Create visualization based on current section
      const visualizationGroup = createVisualization(data, currentSection, THREE);
      scene.add(visualizationGroup);

      // Setup controls if available
      let controls = null;
      if (OrbitControls) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 10;
        controls.maxDistance = 500;
      }

      // Store scene references
      sceneRef.current = {
        scene,
        camera,
        renderer,
        controls,
        starfield,
        visualizationGroup
      };

      // Add canvas to container
      container.appendChild(canvas);

      // Handle window resize
      const handleResize = () => {
        if (!sceneRef.current || !containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = rect.width || 800;
        const newHeight = rect.height || 600;
        
        sceneRef.current.camera.aspect = newWidth / newHeight;
        sceneRef.current.camera.updateProjectionMatrix();
        sceneRef.current.renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      // Animation loop
      const clock = new THREE.Clock();
      
      const animate = () => {
        if (!sceneRef.current) return;
        
        const elapsedTime = clock.getElapsedTime();
        
        // Animate starfield
        if (sceneRef.current.starfield) {
          sceneRef.current.starfield.rotation.y = elapsedTime * 0.1;
        }
        
        // Animate visualization
        if (sceneRef.current.visualizationGroup) {
          sceneRef.current.visualizationGroup.rotation.y = elapsedTime * 0.2;
        }
        
        // Update controls
        if (sceneRef.current.controls) {
          sceneRef.current.controls.update();
        }
        
        // Render
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
        
        // Continue animation
        animationFrameRef.current = requestAnimationFrame(animate);
      };

      // Start animation
      animate();

      // Store cleanup function
      sceneRef.current.cleanup = () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      isInitializedRef.current = true;
      setIsLoading(false);
      console.log('Three.js scene initialized successfully');

    } catch (error: unknown) {
      console.error('Error initializing Three.js scene:', error);
      setHasError(true);
      setErrorMessage(`Failed to initialize 3D visualization: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [data, currentSection, isClient, cleanup]);

  // Effect to initialize/update scene
  useEffect(() => {
    if (!isClient || !data.length) return;

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      initializeScene();
    }, 100);

    // Cleanup timeout and scene on unmount or dependency change
    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [data, currentSection, isClient, initializeScene, cleanup]);

  // Handle section change
  const handleSectionChange = useCallback((newSection: string) => {
    setCurrentSection(newSection);
    setIsLoading(true);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    setHasError(false);
    setErrorMessage("");
    setIsLoading(true);
    cleanup();
    // Force re-initialization
    setTimeout(() => {
      initializeScene();
    }, 100);
  }, [cleanup, initializeScene]);

  const sections = [
    { id: "orbits", name: "Orbital Patterns", description: "Explore the orbital dynamics" },
    { id: "sequences", name: "Sequence Flow", description: "Follow the mathematical journey" },
    { id: "patterns", name: "Pattern Analysis", description: "Discover hidden structures" },
    { id: "insights", name: "Your Insights", description: "Your Collatz discoveries" }
  ];

  if (hasError) {
    return (
      <div className={styles.collatzUniverse}>
        <div className={styles.errorContainer}>
          <h2>Something went wrong with the 3D visualization</h2>
          <p>{errorMessage}</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.collatzUniverse}>
      {/* Navigation Menu */}
      <nav className={styles.universeNav}>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`${styles.navButton} ${currentSection === section.id ? styles.active : ""}`}
            onClick={() => handleSectionChange(section.id)}
          >
            <span className={styles.navTitle}>{section.name}</span>
            <span className={styles.navDescription}>{section.description}</span>
          </button>
        ))}
      </nav>

      {/* 3D Scene Container */}
      <div 
        className={styles.universeContainer} 
        ref={containerRef}
      >
        {(!isClient || isLoading) && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p>{!isClient ? 'Initializing...' : 'Loading Collatz Universe...'}</p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className={styles.infoPanel}>
        <h3>Collatz Conjecture Universe</h3>
        <p>
          Welcome to an immersive exploration of the Collatz conjecture. 
          Each visualization represents mathematical patterns in 3D space.
        </p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{data.length}</span>
            <span className={styles.statLabel}>Numbers Analyzed</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {data.length > 0 ? Math.max(...data.map(d => d.timesStayedOdd)) : 0}
            </span>
            <span className={styles.statLabel}>Max Odd Steps</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {data.length > 0 ? Math.max(...data.map(d => d.divCount)) : 0}
            </span>
            <span className={styles.statLabel}>Max Divisions</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Creates starfield background
 */
function createStarfield(THREE: typeof import('three')): any {
  const starfieldGeometry = new THREE.BufferGeometry();
  const starCount = 1000;
  const starPositions = new Float32Array(starCount * 3);
  
  for (let i = 0; i < starCount * 3; i += 3) {
    starPositions[i] = (Math.random() - 0.5) * 2000;
    starPositions[i + 1] = (Math.random() - 0.5) * 2000;
    starPositions[i + 2] = (Math.random() - 0.5) * 2000;
  }
  
  starfieldGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starfieldMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2,
    transparent: true,
    opacity: 0.8
  });
  
  return new THREE.Points(starfieldGeometry, starfieldMaterial);
}

/**
 * Creates visualization based on section
 */
function createVisualization(data: MulData[], section: string, THREE: typeof import('three')): any {
  switch (section) {
    case "orbits":
      return createOrbitalVisualization(data, THREE);
    case "sequences":
      return createSequenceVisualization(data, THREE);
    case "patterns":
      return createPatternVisualization(data, THREE);
    case "insights":
      return createInsightsVisualization(THREE);
    default:
      return createOrbitalVisualization(data, THREE);
  }
}

/**
 * Creates orbital visualization
 */
function createOrbitalVisualization(data: MulData[], THREE: typeof import('three')): any {
  const group = new THREE.Group();
  
  data.forEach((item, index) => {
    const radius = 10 + (item.n % 20) * 2;
    const angle = (index / data.length) * Math.PI * 2;
    
    // Create orbital ring
    const ringGeometry = new THREE.RingGeometry(radius - 0.5, radius + 0.5, 32);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: getColorForNumber(item.n),
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = (item.timesStayedOdd / 10) * 5;
    group.add(ring);
    
    // Create central sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: getColorForNumber(item.n),
      emissive: getColorForNumber(item.n),
      emissiveIntensity: 0.2
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(
      Math.cos(angle) * radius,
      (item.timesStayedOdd / 10) * 5,
      Math.sin(angle) * radius
    );
    group.add(sphere);
  });
  
  return group;
}

/**
 * Creates sequence visualization
 */
function createSequenceVisualization(data: MulData[], THREE: typeof import('three')): any {
  const group = new THREE.Group();
  
  data.forEach((item, index) => {
    if (item.multiplyChain && item.multiplyChain.length > 1) {
      // Create sequence path
      const points = [];
      for (let i = 0; i < Math.min(item.multiplyChain.length, 20); i++) {
        const x = i * 2;
        const y = Math.log(Math.max(item.multiplyChain[i], 1)) * 2;
        const z = index * 3;
        points.push(new THREE.Vector3(x, y, z));
      }
      
      if (points.length > 1) {
        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 64, 0.3, 8, false);
        const material = new THREE.MeshPhongMaterial({
          color: getColorForNumber(item.n),
          transparent: true,
          opacity: 0.8
        });
        const tube = new THREE.Mesh(geometry, material);
        group.add(tube);
      }
    }
  });
  
  return group;
}

/**
 * Creates pattern analysis visualization
 */
function createPatternVisualization(data: MulData[], THREE: typeof import('three')): any {
  const group = new THREE.Group();
  
  // Create a 3D scatter plot
  data.forEach((item) => {
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshPhongMaterial({
      color: getColorForNumber(item.n),
      emissive: getColorForNumber(item.n),
      emissiveIntensity: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    sphere.position.set(
      (item.n % 100) / 10,
      item.timesStayedOdd * 2,
      item.divCount * 2
    );
    
    group.add(sphere);
  });
  
  return group;
}

/**
 * Creates insights visualization
 */
function createInsightsVisualization(THREE: typeof import('three')): any {
  const group = new THREE.Group();
  
  // Create mathematical symbols and insights
  const symbols = ['∑', '∫', 'π', '∞', 'φ', '√', '∇', '∂'];
  
  symbols.forEach((symbol, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.fillStyle = 'rgba(0, 0, 0, 0.1)';
      context.fillRect(0, 0, 128, 128);
      context.font = '96px Arial';
      context.fillStyle = 'rgba(255, 255, 255, 0.9)';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(symbol, 64, 64);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        opacity: 0.8
      });
      const sprite = new THREE.Sprite(material);
      
      const angle = (index / symbols.length) * Math.PI * 2;
      sprite.position.set(
        Math.cos(angle) * 50,
        Math.sin(index) * 20 + 30,
        Math.sin(angle) * 50
      );
      sprite.scale.set(10, 10, 10);
      
      group.add(sprite);
    }
  });
  
  return group;
}

/**
 * Get color based on number properties
 */
function getColorForNumber(n: number): number {
  if (n <= 1) return 0xffffff;
  
  // Check if it's a power of 2 minus 1 (Mersenne-like)
  const log2 = Math.log2(n + 1);
  if (Math.abs(log2 - Math.round(log2)) < 0.001) {
    return 0xff8c00; // Orange for Mersenne-like numbers
  } else if (n % 4 === 3) {
    return 0x4a90e2; // Blue for 3 mod 4 numbers
  } else {
    return 0x50c878; // Green for other numbers
  }
}