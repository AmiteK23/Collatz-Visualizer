# 📊 Collatz Visualizer

![MIT License](https://img.shields.io/badge/license-MIT-blue)
![Built with Next.js](https://img.shields.io/badge/Next.js-frontend-blue)
![Python Flask](https://img.shields.io/badge/Flask-backend-yellow)
![Three.js](https://img.shields.io/badge/Three.js-3D-green)

An interactive web app that visualizes the [Collatz Conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture) with scientific-style insights, dynamic stats, and beautiful 3D graphics.

🔗 [Live Demo](https://collatz-visualizer.vercel.app)  
📁 [Frontend Code](https://github.com/AmiteK23/Collatz-Visualizer/tree/main/frontend)  
⚙️ [Backend API](https://github.com/AmiteK23/Collatz-Visualizer/tree/main/backend)

---

## 🧠 About the Project

This tool explores the mathematical patterns hidden in the Collatz Conjecture, offering both **interactive data analysis** and **real-time 3D sequence rendering**. It serves as both a visualizer and an analytical tool to better understand this fascinating problem.

## 🧩 Project Goals

This project aims to:

🔍 Investigate the Collatz Conjecture through computational methods and visual modeling, offering new ways to interpret and explore its structure.

🧱 Develop a scalable, modular web application using modern full-stack technologies (Next.js, Flask), with a focus on performance and data integrity.

📈 Present mathematical patterns visually, combining algorithmic logic with real-time 3D rendering and interactive charts to support both educational and analytical use cases.

---

## 🚀 Features

### 📊 Chart Analysis

- **Analyze Stats**:
  - Max Steps
  - Max Value
  - Odd Steps
  - Harmonic Sum
  - Growth Factor
- **Toggle Chart Types**:
  - **Bar** / **Line**
- **Export Data**:
  - **JSON**
  - **SVG**

### 🌌 3D Sequence Visualizer

- **Animated Collatz Sequences**: Visualize Collatz sequences in 3D with smooth animations.
- **Smooth Curve Rendering with Catmull-Rom Splines**: The 3D visualizer employs THREE.CatmullRomCurve3 from Three.js to interpolate between sequence points, resulting in smooth and continuous curves that enhance the visual representation of the Collatz sequences.

### 🔢 2^n Range Visualizer

- Visualizes Collatz sequences for numbers in the range \( 2^n \) to \( 2^{(n+1)} \).

### 🧑‍💻 Python Analysis Scripts

- Includes Python scripts for in-depth Collatz sequence analysis:
  - **Max Steps**
  - **Max Value**
  - **Odd Steps**
  - **Total Sum**
  - **Growth Factor**
- These scripts provide a programmatic approach to extract statistical insights, aiding in further exploration of the Collatz conjecture.

### 🧮 Backend API

- Built with **Python + Flask**
- Efficiently computes Collatz data over large ranges

---

## 🛠️ Tech Stack

| Layer      | Tech Used                                |
| ---------- | ---------------------------------------- |
| Frontend   | Next.js, React, SCSS, Chart.js, Three.js |
| Backend    | Python, Flask                            |
| Deployment | Vercel (frontend), Render (backend)      |

---

## 🗂️ Project Structure

<details> <summary><strong>📦 Root</strong> — Project entry point</summary>
collatz-visualizer/
├── backend/                  # Flask API
├── frontend/                 # Next.js App (App Router)
├── requirements.txt          # Python dependencies
├── .env.local                # Local environment variables (not committed)
├── .gitignore                # Git ignored files
└── README.md                 # Project documentation
</details>
<details> <summary><strong>🧠 Backend</strong> — Python + Flask API</summary>
backend/
├── __init__.py               # Flask app factory
├── routes/                  # API route handlers
│   └── collatz.py            # Endpoint logic for sequence/statistics
└── utils/                   # Sequence computation logic
    ├── collatz.py            # Core Collatz logic
    └── stats.py              # Statistical analysis functions
</details>
<details> <summary><strong>🎨 Frontend</strong> — Next.js + App Router</summary>
frontend/
├── public/                   # Static assets (SVGs, favicon, etc.)
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── ...
├── src/
│   ├── app/                  # App Router entry
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   └── page.module.css   # Styling for landing page
│   ├── components/           # React components (each with SCSS Modules)
│   │   ├── ChartAnalysis/
│   │   ├── ThreeDVis/
│   │   ├── PowerRangeVis/
│   │   ├── LoadingScreen/
│   │   ├── Footer/
│   │   └── Explanations/
│   ├── utils/                # Frontend utilities (CSV, JSON, math helpers)
│   ├── globals.scss          # Global SCSS styles
│   └── _variables.scss       # SCSS variables
</details>

---

## 👨‍💻 Author

**Amit Levi**  
📫 [LinkedIn](https://www.linkedin.com/in/amit-levi-538558221) • [GitHub](https://github.com/AmiteK23)

---

## 📝 License

This project is open source under the [MIT License](LICENSE).  
Feel free to use, fork, and build upon it — just drop a ⭐ if you find it useful!

---

## 📌 Notes

- Actively maintained with new features coming soon
- Great for devs, recruiters, students & math enthusiasts

---

## 🌟 Contributing

Fork it, star it, or raise an issue — PRs are always welcome!
