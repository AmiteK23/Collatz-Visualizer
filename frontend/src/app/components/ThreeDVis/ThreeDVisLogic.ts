import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MulData } from "./types";
import styles from "./ThreeDVis.module.scss";
import { getApiBaseUrl } from "../../../utils/getApiBaseUrl";

//API URL
const API_BASE_URL = getApiBaseUrl();

// Maximum range size to prevent performance issues
export const MAX_RANGE_SIZE = 10000;

/**
 * Function that calculates Collatz sequence data locally
 */
export function calculateCollatzData(startN: number, endN: number): MulData[] {
  const results: MulData[] = [];

  for (let n = startN; n <= endN; n += 2) {
    // Only process odd numbers
    if (n % 2 === 0) continue;

    let current = n;
    const multiplyChain = [current];
    let timesStayedOdd = 0;

    // Follow the 3n+1 process until we reach an even number
    while (current % 2 === 1) {
      current = 3 * current + 1;
      multiplyChain.push(current);
      if (current % 2 === 1) timesStayedOdd++;
    }

    // Calculate how many times we can divide by 2
    let divCount = 0;
    const finalEven = current;
    let tempCurrent = current;

    while (tempCurrent % 2 === 0) {
      tempCurrent = Math.floor(tempCurrent / 2);
      divCount++;
    }

    // Store the data
    results.push({
      n,
      multiplyChain,
      finalEven,
      divCount,
      timesStayedOdd,
    });
  }

  return results;
}

/**
 * Try to fetch data from backend, fall back to local calculation if needed
 */
export async function fetchCollatzData(
  start: number,
  end: number
): Promise<MulData[]> {
  // Only try the API if we're in a browser environment
  if (typeof window !== "undefined") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/collatz/visualization/${start}/${end}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(3000) // 3 second timeout
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (
          data.visualizationData &&
          Array.isArray(data.visualizationData) &&
          data.visualizationData.length > 0
        ) {
          console.log("Using backend data for visualization");
          return data.visualizationData;
        }
      }
    } catch (error) {
      console.log("Backend fetch failed, using local calculation", error);
    }
  }

  // Fall back to local calculation
  console.log("Using local calculation for visualization data");
  return calculateCollatzData(start, end);
}

/**
 * Validate and update range
 */
export const validateRange = (
  start: number,
  end: number
): {
  start: number;
  end: number;
  isMaxRange: boolean;
} => {
  // Ensure start is at least 3 and odd
  start = Math.max(3, start);
  if (start % 2 === 0) start += 1;

  // Check if range exceeds the maximum
  const isMaxRange = end - start > MAX_RANGE_SIZE;

  if (isMaxRange) {
    end = start + MAX_RANGE_SIZE;
  }

  return { start, end, isMaxRange };
};

/**
 * Creates an enhanced 3D visualization scene for Collatz data with Bruno Simon-style elements
 */
export function createVisualizationScene(
  container: HTMLDivElement,
  data: MulData[]
): {
  cleanup: () => void;
  labels: HTMLDivElement[];
} {
  // Scene setup
  const width = container.clientWidth;
  const height = container.clientHeight;
  const scene = new THREE.Scene();
  
  // Enhanced background with gradient effect
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, 2);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(1, '#1a1a4a');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 2);
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
  }

  // Camera with better positioning
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(30, 40, 60);

  // Enhanced renderer with better quality
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
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Enhanced orbit controls
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;
  orbitControls.maxDistance = 200;
  orbitControls.minDistance = 10;
  orbitControls.autoRotate = true;
  orbitControls.autoRotateSpeed = 0.5;

  // Enhanced grid helper with better styling
  const gridHelper = new THREE.GridHelper(200, 40, 0x444444, 0x222222);
  gridHelper.position.y = -20;
  scene.add(gridHelper);

  // Enhanced lighting setup
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);

  // Main directional light with shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(50, 100, 50);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  scene.add(directionalLight);

  // Additional point lights for dramatic effect
  const pointLight1 = new THREE.PointLight(0x4a90e2, 0.8, 100);
  pointLight1.position.set(-30, 50, -30);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xe24a4a, 0.6, 100);
  pointLight2.position.set(30, 30, 30);
  scene.add(pointLight2);

  // Create central mathematical structure
  const centralStructure = new THREE.Group();
  scene.add(centralStructure);

  // Add a central sphere representing the mathematical core
  const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.8,
    shininess: 100
  });
  const centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  centralSphere.castShadow = true;
  centralSphere.receiveShadow = true;
  centralStructure.add(centralSphere);

  // Create orbit paths with enhanced materials
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  // Create a reference axis with better styling
  const axesHelper = new THREE.AxesHelper(30);
  scene.add(axesHelper);

  // Calculate max values for scaling
  const maxDiv = Math.max(...data.map((item) => item.divCount));
  const maxOdd = Math.max(...data.map((item) => item.timesStayedOdd));

  // Store labels for cleanup
  const labels: HTMLDivElement[] = [];

  // Generate enhanced orbital paths
  data.forEach((item) => {
    // Determine radius based on n value with more variation
    const radius = 8 + (item.n % 15) * 1.2;
    const orbitalTilt = ((item.n % 7) * Math.PI) / 14;

    // Create orbit path with enhanced geometry
    const orbitPath = new THREE.EllipseCurve(
      0,
      0, // Center x, y
      radius,
      radius * (0.7 + (item.divCount / (maxDiv || 1)) * 0.5), // Radius x, y
      0,
      2 * Math.PI, // Start angle, end angle
      false, // Clockwise
      orbitalTilt // Rotation
    );

    const points = orbitPath.getPoints(100); // More points for smoother curves
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Enhanced material with glow effect
    let color;
    if (item.n === Math.pow(2, Math.floor(Math.log2(item.n))) - 1) {
      // Mersenne-like numbers
      color = 0xff8c00;
    } else if (item.n % 4 === 3) {
      // 3 mod 4 numbers
      color = 0x4a90e2;
    } else {
      // Other odd numbers
      color = 0x50c878;
    }

    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });

    const line = new THREE.Line(geometry, material);
    orbitGroup.add(line);

    // Add orbital points with enhanced styling
    const pointGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const pointMaterial = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.2,
      shininess: 100
    });

    // Add points at key positions along the orbit
    const keyPoints = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
    keyPoints.forEach((angle, pointIndex) => {
      const x = radius * Math.cos(angle + orbitalTilt);
      const y = radius * Math.sin(angle + orbitalTilt) * (0.7 + (item.divCount / (maxDiv || 1)) * 0.5);
      const z = (item.timesStayedOdd / (maxOdd || 1)) * 10;

      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.position.set(x, y, z);
      point.castShadow = true;
      orbitGroup.add(point);

      // Add floating labels for key numbers
      if (pointIndex === 0) {
        const label = document.createElement('div');
        label.className = styles.orbitLabel;
        label.textContent = item.n.toString();
        label.style.position = 'absolute';
        label.style.color = `#${color.toString(16)}`;
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        label.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
        label.style.pointerEvents = 'none';
        container.appendChild(label);
        labels.push(label);

        // Update label position in animation loop
        const updateLabel = () => {
          const vector = new THREE.Vector3(x, y, z);
          vector.project(camera);
          const xPos = (vector.x * 0.5 + 0.5) * width;
          const yPos = (-(vector.y * 0.5) + 0.5) * height;
          label.style.transform = `translate(-50%, -50%) translate(${xPos}px, ${yPos}px)`;
        };
        updateLabel();
      }
    });

    // Add animated particles along the orbit
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Position particles along the orbit
      const angle = (i / particleCount) * 2 * Math.PI;
      const x = radius * Math.cos(angle + orbitalTilt);
      const y = radius * Math.sin(angle + orbitalTilt) * (0.7 + (item.divCount / (maxDiv || 1)) * 0.5);
      const z = (item.timesStayedOdd / (maxOdd || 1)) * 10;
      
      particle.position.set(x, y, z);
      particle.userData = { 
        originalAngle: angle,
        radius: radius,
        orbitalTilt: orbitalTilt,
        speed: 0.01 + Math.random() * 0.02
      };
      orbitGroup.add(particle);
    }
  });

  // Add floating mathematical symbols
  const symbols = ['∑', '∫', 'π', '∞', 'φ', '√'];
  symbols.forEach((symbol) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      context.fillRect(0, 0, 64, 64);
      context.font = '48px Arial';
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(symbol, 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100 + 50,
        (Math.random() - 0.5) * 100
      );
      sprite.scale.set(5, 5, 5);
      scene.add(sprite);
    }
  });

  // Animation loop with enhanced effects
  const clock = new THREE.Clock();
  
  const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    
    // Rotate central structure
    centralStructure.rotation.y = elapsedTime * 0.2;
    centralStructure.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
    
    // Animate particles along orbits
    orbitGroup.children.forEach((child) => {
      if (child.userData && child.userData.originalAngle !== undefined) {
        const angle = child.userData.originalAngle + elapsedTime * child.userData.speed;
        const radius = child.userData.radius;
        const orbitalTilt = child.userData.orbitalTilt;
        
        child.position.x = radius * Math.cos(angle + orbitalTilt);
        child.position.y = radius * Math.sin(angle + orbitalTilt) * 0.8;
        child.position.z = Math.sin(elapsedTime * 2 + angle) * 2;
      }
    });
    
    // Animate lights
    pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 30;
    pointLight1.position.z = Math.cos(elapsedTime * 0.5) * 30;
    pointLight2.position.x = Math.sin(elapsedTime * 0.3 + Math.PI) * 30;
    pointLight2.position.z = Math.cos(elapsedTime * 0.3 + Math.PI) * 30;
    
    // Update labels
    labels.forEach(() => {
      // Label position updates will be handled in the main component
    });
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  // Handle window resize
  const handleResize = () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  };

  window.addEventListener('resize', handleResize);

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    
    // Safely remove labels
    labels.forEach(label => {
      if (label && label.parentNode) {
        try {
          label.parentNode.removeChild(label);
        } catch (error) {
          console.warn('Error removing label:', error);
        }
      }
    });
    
    // Safely remove renderer
    if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
      try {
        container.removeChild(renderer.domElement);
      } catch (error) {
        console.warn('Error removing renderer:', error);
      }
    }
    
    // Dispose renderer
    if (renderer) {
      renderer.dispose();
    }
  };

  return { cleanup, labels };
}
