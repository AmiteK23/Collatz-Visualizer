import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MulData } from "./types";
import styles from "./ThreeDVis.module.scss";

// API base URL
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
        `${API_BASE_URL}/collatz/visualization/${start}/${end}`
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
 * Creates a 3D visualization scene for Collatz data
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
  scene.background = new THREE.Color(0x111122); // Dark blue background

  // Camera
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 20, 50);

  // Renderer with better quality
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Add orbit controls
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;

  // Add grid helper
  const gridHelper = new THREE.GridHelper(100, 20, 0x555555, 0x333333);
  scene.add(gridHelper);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.8);
  pointLight.position.set(10, 30, 20);
  scene.add(pointLight);

  // Create orbit paths
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  // Create a reference axis
  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);

  // Calculate max values for scaling
  const maxDiv = Math.max(...data.map((item) => item.divCount));
  const maxOdd = Math.max(...data.map((item) => item.timesStayedOdd));

  // Store labels for cleanup
  const labels: HTMLDivElement[] = [];

  // Generate orbital paths
  data.forEach((item) => {
    // Determine radius based on n value
    const radius = 5 + (item.n % 10) * 0.5;
    const orbitalTilt = ((item.n % 7) * Math.PI) / 14;

    // Create orbit path
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

    const points = orbitPath.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Decide color based on pattern properties
    let color;
    if (((item.n + 1) & item.n) === 0) {
      // Special numbers (2^m - 1)
      color = 0xff5722; // Orange
    } else if (item.n % 4 === 3) {
      color = 0x3b82f6; // Blue
    } else {
      color = 0x10b981; // Green
    }

    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
    });

    const ellipse = new THREE.Line(geometry, material);

    // Position the orbit in 3D space
    const itemOrbitGroup = new THREE.Group();
    itemOrbitGroup.add(ellipse);

    // Rotate to create a 3D effect
    itemOrbitGroup.rotation.x =
      ((item.timesStayedOdd / (maxOdd || 1)) * Math.PI) / 2;
    itemOrbitGroup.rotation.z = ((item.divCount / (maxDiv || 1)) * Math.PI) / 3;

    // Position based on the number properties
    itemOrbitGroup.position.set(
      (item.n % 15) - 7.5, // Distribute horizontally in clusters
      item.divCount * 0.5, // Height based on division count
      (item.n % 12) - 6 // Depth based on another pattern
    );

    scene.add(itemOrbitGroup);

    // Add a sphere to represent the number
    const sphereGeom = new THREE.SphereGeometry(0.4, 16, 16);
    const sphereMat = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.2,
      specular: 0xffffff,
      shininess: 30,
    });

    const sphere = new THREE.Mesh(sphereGeom, sphereMat);

    // Calculate position on the orbit
    const angle = ((item.n % 50) / 50) * Math.PI * 2;
    const x = itemOrbitGroup.position.x + Math.cos(angle) * radius;
    const z =
      itemOrbitGroup.position.z +
      Math.sin(angle) * radius * (0.7 + (item.divCount / (maxDiv || 1)) * 0.5);

    sphere.position.set(x, itemOrbitGroup.position.y, z);

    // Add text label for the number
    const textDiv = document.createElement("div");
    textDiv.className = styles.numberLabel;
    textDiv.textContent = item.n.toString();

    // Convert numeric color to hex string with proper formatting
    const colorHex = "#" + color.toString(16).padStart(6, "0");

    textDiv.style.color = colorHex;
    textDiv.style.position = "absolute";
    textDiv.style.fontSize = "12px";
    textDiv.style.fontWeight = "bold";
    textDiv.style.textShadow = "0px 0px 3px rgba(0,0,0,0.7)";

    container.appendChild(textDiv);
    labels.push(textDiv);

    // Store info for updating label positions in animation loop
    sphere.userData = {
      label: textDiv,
      value: item.n,
      data: item,
    };

    scene.add(sphere);
  });

  // Animation loop
  let frame = 0;
  let animationId: number;

  const animate = () => {
    frame++;
    animationId = requestAnimationFrame(animate);

    // Update controls for smooth movement
    orbitControls.update();

    // Slowly rotate the entire scene for a dynamic effect
    scene.rotation.y = Math.sin(frame * 0.001) * 0.1;

    // Update labels
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.userData.label) {
        const vector = new THREE.Vector3();
        object.getWorldPosition(vector);
        vector.project(camera);

        const x = (vector.x * 0.5 + 0.5) * width;
        const y = (-vector.y * 0.5 + 0.5) * height;

        const label = object.userData.label as HTMLDivElement;
        label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;

        // Hide labels behind the camera
        label.style.display = vector.z < 1 ? "block" : "none";
      }
    });

    renderer.render(scene, camera);
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

  window.addEventListener("resize", handleResize);

  // Return cleanup function
  const cleanup = () => {
    window.removeEventListener("resize", handleResize);
    cancelAnimationFrame(animationId);

    // Clean up labels
    labels.forEach((label) => {
      label.remove();
    });

    // Dispose of Three.js objects
    renderer.dispose();
    orbitControls.dispose();

    // Clean up materials and geometries
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();

        if (object.material instanceof THREE.Material) {
          object.material.dispose();
        } else if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        }
      }
    });
  };

  return { cleanup, labels };
}
