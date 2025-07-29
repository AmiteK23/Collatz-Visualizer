"use client";

import React, { useEffect, useRef, useState } from "react";
import { MulData } from "./types";
import styles from "./ThreeDVis.module.scss";

interface CollatzUniverseProps {
  data: MulData[];
  onNavigate?: (section: string) => void;
}

/**
 * Immersive 3D Collatz Universe - Standalone Three.js approach
 */
export default function CollatzUniverse({ data }: CollatzUniverseProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [currentSection, setCurrentSection] = useState("orbits");
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isMountedRef = useRef(true);

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    console.log('CollatzUniverse useEffect triggered:', {
      hasMountRef: !!mountRef.current,
      dataLength: data.length,
      isClient,
      currentSection
    });
    
    if (!mountRef.current || !data.length || !isClient) {
      console.log('Skipping 3D scene creation - missing requirements');
      return;
    }

    // Clear previous content safely
    if (cleanupRef.current) {
      try {
        cleanupRef.current();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
      cleanupRef.current = null;
    }

    // Reset error state
    setHasError(false);
    setErrorMessage("");

    // Create a standalone canvas element (not managed by React)
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.style.width = '100%';
      canvasRef.current.style.height = '100%';
      canvasRef.current.style.display = 'block';
    }

    // Clear the mount container and append the canvas
    const container = mountRef.current;
    if (container) {
      // Use a more robust clearing method
      while (container.firstChild) {
        try {
          container.removeChild(container.firstChild);
        } catch (error) {
          console.warn('Error removing child:', error);
          break;
        }
      }
      container.appendChild(canvasRef.current);
    }

    // Initialize Three.js with the standalone canvas
    const initializeThreeJS = async () => {
      try {
        console.log('Starting Three.js initialization...');
        
        // Dynamic import of Three.js
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        
        console.log('Three.js modules loaded successfully');
        
        if (!canvasRef.current) {
          throw new Error('Canvas element is not available');
        }

        console.log('Creating 3D universe...');
        const { cleanup } = createCollatzUniverse(canvasRef.current, data, currentSection, THREE, OrbitControls);
        cleanupRef.current = cleanup;
        
        if (isMountedRef.current) {
          console.log('3D universe created successfully');
          setIsLoading(false);
        }
      } catch (error: unknown) {
        console.error('Error in Three.js initialization:', error);
        
        if (isMountedRef.current) {
          setHasError(true);
          setErrorMessage(`Failed to initialize 3D visualization: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsLoading(false);
        }
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Three.js initialization timeout - showing error');
      if (isMountedRef.current && isLoading) {
        setHasError(true);
        setErrorMessage("3D visualization took too long to load. Please refresh the page.");
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    // Initialize after a short delay to ensure DOM is ready
    const initTimeoutId = setTimeout(() => {
      initializeThreeJS();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initTimeoutId);
      if (cleanupRef.current && isMountedRef.current) {
        try {
          cleanupRef.current();
        } catch (error) {
          console.warn('Error during cleanup effect:', error);
        }
        cleanupRef.current = null;
      }
      // Remove the canvas from the container more safely
      const currentMountRef = mountRef.current;
      const currentCanvasRef = canvasRef.current;
      if (currentCanvasRef && currentMountRef) {
        try {
          if (currentMountRef.contains(currentCanvasRef)) {
            currentMountRef.removeChild(currentCanvasRef);
          }
        } catch (error) {
          console.warn('Error removing canvas:', error);
        }
      }
    };
  }, [data, currentSection, isClient, isLoading]);

  const sections = [
    { id: "orbits", name: "Orbital Patterns", description: "Explore the orbital dynamics" },
    { id: "sequences", name: "Sequence Flow", description: "Follow the mathematical journey" },
    { id: "patterns", name: "Pattern Analysis", description: "Discover hidden structures" },
    { id: "insights", name: "Your Insights", description: "Your Collatz discoveries" }
  ];

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage("");
    setIsLoading(true);
    // Reset canvas reference
    canvasRef.current = null;
    // Force re-render by updating a state
    setCurrentSection(currentSection);
  };

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
            onClick={() => setCurrentSection(section.id)}
          >
            <span className={styles.navTitle}>{section.name}</span>
            <span className={styles.navDescription}>{section.description}</span>
          </button>
        ))}
      </nav>

      {/* 3D Scene Container */}
      <div 
        className={styles.universeContainer} 
        ref={mountRef}
        key={`universe-${currentSection}-${data.length}`}
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
 * Creates the immersive Collatz universe scene
 */
function createCollatzUniverse(
  canvas: HTMLCanvasElement,
  data: MulData[],
  section: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  THREE: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OrbitControls: any
): { cleanup: () => void } {
  // Get canvas dimensions
  const width = canvas.clientWidth || 800;
  const height = canvas.clientHeight || 600;
  
  // Scene setup
  const scene = new THREE.Scene();
  
  // Enhanced background with starfield effect
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
  const starfield = new THREE.Points(starfieldGeometry, starfieldMaterial);
  scene.add(starfield);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 50, 100);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: true,
    alpha: true 
  });
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(50, 50, 50);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0x667eea, 1, 1000);
  pointLight.position.set(0, 100, 0);
  scene.add(pointLight);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.screenSpacePanning = false;
  controls.minDistance = 10;
  controls.maxDistance = 500;

  // Create visualization based on section
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let visualizationGroup: any;
  
  switch (section) {
    case "orbits":
      visualizationGroup = createOrbitalVisualization(data, THREE);
      break;
    case "sequences":
      visualizationGroup = createSequenceVisualization(data, THREE);
      break;
    case "patterns":
      visualizationGroup = createPatternVisualization(data, THREE);
      break;
    case "insights":
      visualizationGroup = createInsightsVisualization(THREE);
      break;
    default:
      visualizationGroup = createOrbitalVisualization(data, THREE);
  }

  scene.add(visualizationGroup);

  // Animation loop
  const clock = new THREE.Clock();
  
  const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    
    // Animate starfield
    starfield.rotation.y = elapsedTime * 0.1;
    
    // Animate visualization
    visualizationGroup.rotation.y = elapsedTime * 0.2;
    
    // Animate individual elements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visualizationGroup.children.forEach((child: any, index: number) => {
      if (child instanceof THREE.Mesh) {
        child.rotation.x = Math.sin(elapsedTime + index) * 0.1;
        child.rotation.z = Math.cos(elapsedTime + index) * 0.1;
      }
    });
    
    // Update controls
    controls.update();
    
    // Render
    renderer.render(scene, camera);
    
    // Continue animation
    requestAnimationFrame(animate);
  };

  // Handle window resize
  const handleResize = () => {
    const newWidth = canvas.clientWidth || 800;
    const newHeight = canvas.clientHeight || 600;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };

  // Start animation
  animate();

  // Add resize listener
  window.addEventListener('resize', handleResize);

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
    controls.dispose();
  };

  return { cleanup };
}

/**
 * Creates orbital visualization
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSequenceVisualization(data: MulData[], THREE: typeof import('three')): any {
  const group = new THREE.Group();
  
  data.forEach((item, index) => {
    // Create sequence path
    const points = [];
    for (let i = 0; i < item.multiplyChain.length; i++) {
      const x = i * 2;
      const y = Math.log(item.multiplyChain[i]) * 2;
      const z = index * 3;
      points.push(new THREE.Vector3(x, y, z));
    }
    
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 64, 0.3, 8, false);
    const material = new THREE.MeshPhongMaterial({
      color: getColorForNumber(item.n),
      transparent: true,
      opacity: 0.8
    });
    const tube = new THREE.Mesh(geometry, material);
    group.add(tube);
  });
  
  return group;
}

/**
 * Creates pattern analysis visualization
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      item.n / 10,
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createInsightsVisualization(THREE: typeof import('three')): any {
  const group = new THREE.Group();
  
  // Create mathematical symbols and insights
  const symbols = ['∑', '∫', 'π', '∞', 'φ', '√', '∇', '∂'];
  
  symbols.forEach((symbol) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.fillStyle = 'rgba(255, 255, 255, 0.1)';
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
      
      sprite.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100 + 50,
        (Math.random() - 0.5) * 100
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
  if (n === Math.pow(2, Math.floor(Math.log2(n))) - 1) {
    return 0xff8c00; // Mersenne-like numbers
  } else if (n % 4 === 3) {
    return 0x4a90e2; // 3 mod 4 numbers
  } else {
    return 0x50c878; // Other odd numbers
  }
} 