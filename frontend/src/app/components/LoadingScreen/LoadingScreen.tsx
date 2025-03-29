"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import styles from "./LoadingScreen.module.scss";

const LoadingScreen: React.FC<{ fadeOut: boolean }> = ({ fadeOut }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (fadeOut) {
      setTimeout(() => setVisible(false), 500);
    }
  }, [fadeOut]);

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
      spiral.rotation.z += 0.002;
      spiral.rotation.x += 0.001;
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
