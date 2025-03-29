"use client";

import React from "react";
import Link from "next/link";
import styles from "./Footer.module.scss";

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.09.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.907-.62.069-.608.069-.608 1.003.07 1.53 1.031 1.53 1.031.892 1.528 2.341 1.087 2.91.832.091-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.682-.103-.254-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844a9.56 9.56 0 012.5.336c1.91-1.294 2.75-1.025 2.75-1.025.545 1.378.202 2.396.1 2.65.64.698 1.028 1.59 1.028 2.682 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.853 0 1.336-.012 2.415-.012 2.743 0 .269.18.577.688.479A10.01 10.01 0 0022 12c0-5.523-4.477-10-10-10z"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"
    />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.linksSection}>
          <Link
            href="https://github.com/amitek23/collatz-visualizer"
            target="_blank"
          >
            GitHub Repo
          </Link>
          <Link
            href="https://en.wikipedia.org/wiki/Collatz_conjecture"
            target="_blank"
          >
            Collatz Conjecture
          </Link>
          <Link href="https://www.numberphile.com/" target="_blank">
            Numberphile
          </Link>
        </div>

        <div className={styles.socialSection}>
          <a
            href="https://github.com/amitek23"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>
          <a
            href="https://www.linkedin.com/in/amit-levi-538558221"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
        </div>

        <div className={styles.bottomSection}>
          <p>Built by Amit Levi — {currentYear}</p>
          <p>“Explore, iterate, converge.”</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
