# 📊 Collatz Visualizer
An interactive web tool that visualizes the Collatz Conjecture with scientific-style insights and 3D graphics.
🔗 [Live Demo](https://collatz-visualizer.vercel.app)  
📁 [Frontend Code](https://github.com/AmiteK23/Collatz-Visualizer/tree/main/frontend)  
⚙️ [Backend API](https://github.com/AmiteK23/Collatz-Visualizer/tree/main/backend)
---
## 🧠 About
This project explores mathematical patterns in the Collatz Conjecture using modern web technologies. It features both 2D data charts and a real-time 3D visualization of Collatz sequences, helping users understand the complexity behind seemingly simple math rules.
Built as part of my personal portfolio to demonstrate full-stack skills, data visualization, and creative problem solving.
---
## 🚀 Features
- 📈 **Chart Analysis**  
  - Max Steps, Max Value, Odd Steps, Total Sum, and Growth Factor  
  - Bar/Line chart toggle (coming soon)
- 🌌 **3D Collatz Sequence Visualizer**  
  - Renders sequences in 3D space using smooth Catmull-Rom curves  
  - Toggle between 2D/3D views
- 📤 **Export Tools**  
  - Download data as JSON or export charts as SVG
- 🧮 **Backend**  
  - Python (Flask) API for calculating large ranges and stats efficiently
---
## 🛠️ Stack
- **Frontend**: Next.js, React, SCSS, Chart.js, Three.js  
- **Backend**: Python, Flask  
- **Deployment**: Vercel (Frontend) + Render (Backend)
---
## 🗂️ Structure
```
collatz-visualizer/
├── backend/              # Flask API logic (Collatz calculations)
│   ├── routes/           # API endpoints
│   └── utils/            # Math logic and helpers
├── frontend/             # Next.js frontend with SCSS and visual components
│   ├── components/       # React components (charts, 3D visualizer, UI)
│   ├── pages/            # Next.js routes
│   └── styles/           # SCSS styling
├── app.py                # Entry point for backend server
├── requirements.txt      # Python dependencies
└── README.md
```
---
## 👨‍💻 Author
**Amit Levi**  
📫 [LinkedIn](https://www.linkedin.com/in/amit-levi-538558221) • [GitHub](https://github.com/AmiteK23)
---
## 📌 Notes
- This project is actively maintained and extended.
- Designed for developers, recruiters, and math enthusiasts alike.
