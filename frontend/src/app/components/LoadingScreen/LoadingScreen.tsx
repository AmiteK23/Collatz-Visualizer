"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./LoadingScreen.module.scss";

const LoadingScreen: React.FC<{ fadeOut: boolean }> = ({ fadeOut }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (fadeOut) {
      const timeout = setTimeout(() => setVisible(false), 550);
      return () => clearTimeout(timeout);
    }
  }, [fadeOut]);

  useEffect(() => {
    // Lock scroll
    if (visible) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  useEffect(() => {
    if (!mountRef.current) return;

    const mountEl = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0f24");

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountEl.appendChild(renderer.domElement);

    const material = new THREE.LineBasicMaterial({ color: 0xa4f971 });

    const createCollatzSpiral = (iterations: number) => {
      const points = [];
      let x = 0,
        y = 0,
        angle = 0;
      for (let i = 1; i < iterations; i++) {
        const value = i % 2 === 0 ? i / 2 : i * 3 + 1;
        angle += Math.PI / ((value % 7) + 1);
        x += Math.cos(angle) * 0.3;
        y += Math.sin(angle) * 0.3;
        points.push(new THREE.Vector3(x, y, i * 0.02));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(geometry, material);
    };

    const spiral = createCollatzSpiral(300);
    scene.add(spiral);

    const animate = () => {
      requestAnimationFrame(animate);
      spiral.rotation.z += 0.005;
      spiral.rotation.x += 0.002;
      spiral.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.03); // pulse
      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      mountEl.removeChild(renderer.domElement);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${styles.loadingWrapper} ${fadeOut ? styles.fadeOut : ""}`}
    >
      <div className={styles.loadingContainer} ref={mountRef}></div>
      <div className={styles.loadingText}>
        Generating Collatz Visualization...
      </div>
    </div>
  );
};

export default LoadingScreen;
