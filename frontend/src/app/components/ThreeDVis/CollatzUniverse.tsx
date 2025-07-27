"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MulData } from "./types";
import styles from "./ThreeDVis.module.scss";

interface CollatzUniverseProps {
  data: MulData[];
  onNavigate?: (section: string) => void;
}

/**
 * Immersive 3D Collatz Universe - Bruno Simon inspired
 */
export default function CollatzUniverse({ data, onNavigate }: CollatzUniverseProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [currentSection, setCurrentSection] = useState("orbits");
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
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
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Safely clear container
    const container = mountRef.current;
    if (container) {
      try {
        // Use innerHTML to clear all children at once - safer than removeChild
        container.innerHTML = '';
      } catch (error) {
        console.warn('Error clearing container with innerHTML:', error);
        // Fallback: try to remove children one by one
        const children = Array.from(container.children);
        children.forEach((child: Element) => {
          try {
            if (child.parentNode === container) {
              container.removeChild(child);
            }
          } catch (removeError) {
            console.warn('Error removing child:', removeError);
          }
        });
      }
    }

    try {
      const { cleanup } = createCollatzUniverse(mountRef.current, data, currentSection);
      cleanupRef.current = cleanup;
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    } catch (error) {
      console.warn('Error creating 3D scene:', error);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }

    return () => {
      if (cleanupRef.current && isMountedRef.current) {
        try {
          cleanupRef.current();
        } catch (error) {
          console.warn('Error during cleanup effect:', error);
        }
        cleanupRef.current = null;
      }
    };
  }, [data, currentSection]);

  const sections = [
    { id: "orbits", name: "Orbital Patterns", description: "Explore the orbital dynamics" },
    { id: "sequences", name: "Sequence Flow", description: "Follow the mathematical journey" },
    { id: "patterns", name: "Pattern Analysis", description: "Discover hidden structures" },
    { id: "insights", name: "Your Insights", description: "Your Collatz discoveries" }
  ];

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
      <div className={styles.universeContainer} ref={mountRef}>
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
              {Math.max(...data.map(d => d.timesStayedOdd))}
            </span>
            <span className={styles.statLabel}>Max Odd Steps</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {Math.max(...data.map(d => d.divCount))}
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
  container: HTMLDivElement,
  data: MulData[],
  section: string
): { cleanup: () => void } {
  // Check if Three.js is available
  if (typeof THREE === 'undefined') {
    console.error('Three.js is not available');
    return {
      cleanup: () => {}
    };
  }
  const width = container.clientWidth;
  const height = container.clientHeight;
  
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

  // Camera
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
  camera.position.set(50, 30, 100);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.maxDistance = 300;
  controls.minDistance = 20;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(100, 100, 50);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Create different visualization modes based on section
  let visualizationGroup: THREE.Group;

  switch (section) {
    case "orbits":
      visualizationGroup = createOrbitalVisualization(data);
      break;
    case "sequences":
      visualizationGroup = createSequenceVisualization(data);
      break;
    case "patterns":
      visualizationGroup = createPatternVisualization(data);
      break;
    case "insights":
      visualizationGroup = createInsightsVisualization(data);
      break;
    default:
      visualizationGroup = createOrbitalVisualization(data);
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
    visualizationGroup.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh) {
        child.rotation.x = Math.sin(elapsedTime + index) * 0.1;
        child.rotation.z = Math.cos(elapsedTime + index) * 0.1;
      }
    });
    
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  // Handle resize
  const handleResize = () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };

  window.addEventListener('resize', handleResize);

  // Cleanup
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    
    // Safely remove renderer
    if (renderer && renderer.domElement) {
      try {
        // Check if the element is actually in the container before removing
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        } else {
          console.warn('Renderer element not found in container');
        }
      } catch (error) {
        console.warn('Error removing renderer:', error);
      }
    }
    
    // Dispose renderer and controls
    if (renderer) {
      try {
        renderer.dispose();
      } catch (error) {
        console.warn('Error disposing renderer:', error);
      }
    }
    if (controls) {
      try {
        controls.dispose();
      } catch (error) {
        console.warn('Error disposing controls:', error);
      }
    }
  };

  return { cleanup };
}

/**
 * Creates orbital visualization
 */
function createOrbitalVisualization(data: MulData[]): THREE.Group {
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
 * Creates sequence flow visualization
 */
function createSequenceVisualization(data: MulData[]): THREE.Group {
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
function createPatternVisualization(data: MulData[]): THREE.Group {
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
function createInsightsVisualization(data: MulData[]): THREE.Group {
  const group = new THREE.Group();
  
  // Create mathematical symbols and insights
  const symbols = ['∑', '∫', 'π', '∞', 'φ', '√', '∇', '∂'];
  
  symbols.forEach((symbol, index) => {
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