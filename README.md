# 🌌 Collatz Visualizer

![MIT License](https://img.shields.io/badge/license-MIT-blue)
![Built with Next.js](https://img.shields.io/badge/Next.js-frontend-blue)
![Python Flask](https://img.shields.io/badge/Flask-backend-yellow)
![Three.js](https://img.shields.io/badge/Three.js-3D-green)

An immersive web application that visualizes the [Collatz Conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture) with stunning 3D graphics, interactive exploration, and mathematical insights. Experience the beauty of mathematical patterns in an immersive universe.

🔗 [Live Demo](https://collatz-visualizer.vercel.app)  
📁 [Frontend Code](https://github.com/AmiteK23/Collatz-Visualizer/tree/main/frontend)  
⚙️ [Backend API](https://github.com/AmiteK23/Collatz-Visualizer/tree/main/backend)

---

## 🧠 About the Project

This tool explores the mathematical patterns hidden in the Collatz Conjecture through an immersive 3D universe experience. It combines **interactive data analysis**, **real-time 3D sequence rendering**, and **beautiful visualizations** to help understand this fascinating mathematical problem.

## 🧩 Project Goals

This project aims to:

🔍 **Investigate the Collatz Conjecture** through computational methods and immersive 3D visual modeling, offering new ways to interpret and explore its structure.

🧱 **Develop a scalable, modular web application** using modern full-stack technologies (Next.js, Flask), with a focus on performance and user experience.

📈 **Present mathematical patterns visually** through an immersive 3D universe, combining algorithmic logic with real-time rendering and interactive charts.

---

## 🚀 Features

### 🌌 Collatz Universe (New!)
- **Immersive 3D Experience**: Explore the Collatz conjecture in a beautiful 3D universe
- **Interactive Navigation**: Switch between different visualization modes
- **Custom Number Input**: Visualize your own ranges of numbers
- **Orbital Patterns**: Watch numbers orbit in 3D space
- **Sequence Flow**: Follow the mathematical journey
- **Pattern Analysis**: Discover hidden structures
- **Your Insights**: Visualize your Collatz discoveries

### 📊 Chart Analysis
- **Comprehensive Statistics**:
  - Max Steps, Max Value, Odd Steps
  - Harmonic Sum, Growth Factor
  - Division Count, Times Stayed Odd
- **Interactive Charts**: Bar and Line visualizations
- **Data Export**: JSON and SVG formats
- **Dark Theme**: Beautiful purple gradient interface

### 🔢 2ⁿ Range Visualizer
- **Power Range Analysis**: Visualize Collatz sequences for numbers in 2ⁿ ranges
- **Custom Tooltips**: Detailed information on hover
- **Responsive Design**: Works perfectly on all devices

### 🧑‍💻 Python Analysis Scripts
- **Advanced Analysis**: Max Steps, Max Value, Odd Steps, Total Sum, Growth Factor
- **Programmatic Insights**: Extract statistical patterns
- **Research Tools**: Aid in further exploration of the Collatz conjecture

### 🧮 Backend API
- **Python + Flask**: Efficient computation over large ranges
- **RESTful Endpoints**: Clean API design
- **Performance Optimized**: Handles large datasets efficiently

---

## 🛠️ Tech Stack

| Layer      | Tech Used                                |
| ---------- | ---------------------------------------- |
| Frontend   | Next.js, React, SCSS, Three.js, Recharts |
| Backend    | Python, Flask                            |
| 3D Graphics| Three.js, OrbitControls                  |
| Styling    | SCSS Modules, Glass Morphism             |
| Deployment | Vercel (frontend), Render (backend)      |

---

## 🗂️ Project Structure

<details> <summary><strong>📦 Root</strong> — Project entry point</summary>
collatz-visualizer/
├── backend/                  # Flask API
├── frontend/                 # Next.js App (App Router)
├── requirements.txt          # Python dependencies
├── setup_backend.bat         # Windows backend setup script
├── README_BACKEND_SETUP.md   # Backend setup guide
├── UNIVERSE_README.md        # Universe feature documentation
├── UNIVERSE_INTEGRATION.md   # Integration guide
├── .env.local                # Local environment variables (not committed)
├── .gitignore                # Git ignored files
└── README.md                 # Project documentation
</details>

<details> <summary><strong>🧠 Backend</strong> — Python + Flask API</summary>
backend/
├── __init__.py               # Flask app factory
├── collatz_backend.py        # Main Flask application
└── app.py                    # Entry point
</details>

<details> <summary><strong>🎨 Frontend</strong> — Next.js + App Router</summary>
frontend/
├── public/                   # Static assets
├── src/
│   ├── app/                  # App Router entry
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   ├── universe/         # Full universe experience
│   │   ├── debug-universe/   # Debug page
│   │   └── globals.scss      # Global styles
│   ├── components/           # React components
│   │   ├── UniverseSection/  # Main universe preview
│   │   ├── ThreeDVis/        # 3D visualization logic
│   │   ├── ChartAnalysis/    # Data analysis charts
│   │   ├── PowerRangeVis/    # 2ⁿ range visualizer
│   │   ├── PythonCodeSharing/# Analysis scripts
│   │   ├── About/            # Documentation
│   │   ├── Header/           # Navigation
│   │   └── Footer/           # Footer component
│   └── utils/                # Frontend utilities
</details>

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
# Windows (using provided script)
setup_backend.bat

# Manual setup
py -m pip install -r requirements.txt
py app.py
```

### Alternative Backend Setup
See [README_BACKEND_SETUP.md](README_BACKEND_SETUP.md) for detailed instructions.

---

## 🌟 Key Features

### 🎨 Beautiful UI/UX
- **Purple Gradient Theme**: Immersive dark theme with purple gradients
- **Glass Morphism**: Modern frosted glass effects
- **Responsive Design**: Perfect on desktop and mobile
- **Smooth Animations**: Fluid transitions and interactions

### 🔧 Technical Excellence
- **Error Boundaries**: Graceful error handling
- **Performance Optimized**: Efficient 3D rendering
- **API Fallbacks**: Local calculation when backend unavailable
- **Mobile Optimized**: Touch-friendly controls

### 📚 Comprehensive Documentation
- **Interactive Tutorials**: Built-in learning guides
- **Mathematical Insights**: Detailed explanations
- **API Documentation**: Complete backend reference

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

- **Actively Maintained**: New features and improvements regularly added
- **Perfect for**: Developers, researchers, students & math enthusiasts
- **Educational Value**: Great for learning about the Collatz conjecture
- **Research Tool**: Useful for mathematical exploration and analysis

---

## 🌟 Contributing

Fork it, star it, or raise an issue — PRs are always welcome!

### Recent Updates
- ✨ **New Collatz Universe**: Immersive 3D experience
- 🎨 **Purple Theme**: Beautiful gradient design
- 📱 **Mobile Optimized**: Perfect responsive design
- 🔧 **Performance**: Optimized 3D rendering
- 📚 **Documentation**: Comprehensive guides and tutorials
