# 📊 Collatz Visualizer

An interactive web app that visualizes the [Collatz Conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture) with scientific-style insights, dynamic stats, and beautiful 3D graphics.

🔗 [Live Demo](https://collatz-visualizer.vercel.app)  
📁 [Frontend Code](https://github.com/AmiteK23/Collatz-Visualizer/tree/main/frontend)  
⚙️ [Backend API](https://github.com/AmiteK23/Collatz-Visualizer/tree/main/backend)

---

## 🧠 About the Project

This tool explores the mathematical patterns hidden in the Collatz Conjecture, offering both **interactive data analysis** and **real-time 3D sequence rendering**. It serves as both a visualizer and an analytical tool to better understand this fascinating problem.

Built to showcase:

- ✨ Creative problem-solving
- 📊 Full-stack web development
- 🧮 Applied mathematics & data visualization

---

## 🚀 Features

### 📊 Chart Analysis

- **Analyze Stats**:
  - Max Steps
  - Max Value
  - Odd Steps
  - Total Sum
  - Growth Factor
- **Toggle Chart Types**:
  - **Bar** / **Line** (coming soon)
- **Export Data**:
  - **JSON**
  - **SVG**

### 🌌 3D Sequence Visualizer

- **Animated Collatz Sequences**: Visualize Collatz sequences in 3D with smooth animations.
- **Smooth Catmull-Rom Curve Rendering**: The 3D visualizer uses Catmull-Rom splines to create fluid transitions between points.
- **View Modes**: Toggle between **2D** and **3D** views for better scientific clarity and exploration of the sequences.

### 🔢 2^n Range Visualizer

- Visualizes Collatz sequences for numbers in the range \( 2^n \) to \( 2^{(n+1)} \).
- **Catmull-Rom Splines**: Use smooth spline rendering for visual clarity.
- Toggle between **2D** and **3D** views for easy comparison.

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

collatz-visualizer/ ├── backend/ # Flask API (Collatz logic) │ ├── routes/ # API endpoints │ └── utils/ # Sequence + stats calculations ├── frontend/ # Next.js frontend │ ├── components/ # Charts, 3D renderer, UI │ ├── pages/ # Route files │ └── styles/ # SCSS modules ├── app.py # Flask entry point ├── requirements.txt # Python dependencies └── README.md # Project documentation

yaml
Copy

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
