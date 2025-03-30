"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Explanations from "../Explanations/Explanations";
import styles from "./Header.module.scss";

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect screen size and scroll position
  useEffect(() => {
    // Set initial mobile state
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkMobile();

    // Detect scroll to add background opacity on scroll
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };

    // Attach event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Add smooth scroll function
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    // Only handle links with hash/id
    const href = e.currentTarget.href;
    const targetId = href.includes("#") ? href.split("#")[1] : null;

    if (targetId) {
      e.preventDefault();
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70, // Adjust offset for header height
          behavior: "smooth",
        });
        // Close the mobile menu after navigation
        setMobileMenuOpen(false);

        // Restore body scrolling
        document.body.style.overflow = "";
      }
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = (): void => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Prevent body scrolling when menu is open
    document.body.style.overflow = !mobileMenuOpen ? "hidden" : "";
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.container}>
          <div className={styles.logoSection}>
            <Link href="/" className={styles.logo}>
              Collatz Visualizer
            </Link>
          </div>

          {/* Mobile controls - only show on mobile */}
          {isMobile && (
            <div className={styles.mobileControls}>
              {/* Explanations component - only shown on mobile */}
              <div className={styles.explanationsWrapper}>
                <Explanations />
              </div>

              {/* Mobile menu hamburger button */}
              <button
                className={`${styles.mobileMenuButton} ${
                  mobileMenuOpen ? styles.open : ""
                }`}
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
              >
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
                <span className={styles.hamburgerLine}></span>
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav
            className={`${styles.navigation} ${
              mobileMenuOpen ? styles.mobileMenuOpen : ""
            }`}
          >
            <Link href="/#about" onClick={handleSmoothScroll}>
              About
            </Link>
            <Link href="/#threeDVis" onClick={handleSmoothScroll}>
              3D Visualizer
            </Link>
            <Link href="/#chartAnalysis" onClick={handleSmoothScroll}>
              Chart Analysis
            </Link>
            <Link href="/#powersOfTwo" onClick={handleSmoothScroll}>
              2ⁿ Range Charts
            </Link>
            <Link href="/#analysisScripts" onClick={handleSmoothScroll}>
              Analysis Scripts
            </Link>
          </nav>

          {/* Explanations for desktop view - only show on desktop */}
          {!isMobile && (
            <div className={styles.explanationsWrapper}>
              <Explanations />
            </div>
          )}
        </div>
      </header>

      {/* This spacer prevents content from being hidden behind the fixed header */}
      <div className={styles.headerSpacer}></div>
    </>
  );
};

export default Header;
