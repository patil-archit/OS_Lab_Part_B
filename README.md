# 🚀 OS Simulator & Visualizer

A powerful, interactive full-stack application designed to simulate and visualize complex Operating System concepts. This project bridges the gap between theoretical OS algorithms and practical understanding through dynamic visualizations and AI-powered analysis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![Tailwind](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white)
![AI](https://img.shields.io/badge/AI-LangChain%20%2B%20Groq-green)

## ✨ Key Features

### 1. Process Scheduling Simulator
Visualize how different CPU scheduling algorithms manage processes in real-time.
-   **Algorithms Supported**:
    -   First-Come, First-Served (FCFS)
    -   Shortest Job First (SJF)
    -   Round Robin (RR)
    -   Priority Scheduling
-   **Features**: Custom process inputs (Arrival Time, Burst Time, Priority), Gantt Chart generation, and average waiting/turnaround time calculations.

### 2. Concurrency & Synchronization Visualizations
Interactive "Playgrounds" to understand classic concurrency problems and solution primitives.
-   **Classic Problems**:
    -   **Dining Philosophers**: Visualizes deadlock and resource sharing.
    -   **Producer-Consumer**: Demonstrates buffer management.
    -   **Readers-Writers**: Shows innovative multi-branch rendering for reader access patterns.
-   **Primitives**:
    -   **Mutex Locks**: Visualizes critical section protection.
    -   **Semaphores**: Demonstrates counting semaphores controlling resource access.
-   **Dangers**:
    -   **Deadlock**: Interactive graph showing circular dependency.
    -   **Race Conditions**: Visual demo of shared variable data corruption.
    -   **Starvation**: Visualizes low-priority process neglect.

### 3. AI-Powered Analysis 🧠
Integrated **LangChain** and **Groq** to provide intelligent insights on your simulation runs.
-   **Risk Analysis**: Detects potential race conditions, deadlocks, or starvation in your custom schedules.
-   **Optimization Tips**: Suggests better algorithms based on your specific workload distribution.

---

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React (Vite)
-   **Styling**: TailwindCSS (with extensive custom animations)
-   **Motion**: Framer Motion (for smooth transitions and physics-based animations)
-   **Icons**: Lucide React

### Backend
-   **Framework**: FastAPI (Python)
-   **AI Engine**: LangChain + Groq API (LLaMA3/Mixtral)
-   **Data Validation**: Pydantic
-   **Server**: Uvicorn

---

## 🚀 Installation & Setup

Follow these steps to get the project running locally.

### Prerequisites
-   **Node.js** (v18+)
-   **Python** (v3.10+)
-   **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/patil-archit/OS_Lab_Part_B.git
cd OS_Lab_Part_B
```

### 2. Backend Setup
The backend handles simulation logic and AI analysis.

```bash
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file for AI features
echo "GROQ_API_KEY=your_api_key_here" > .env
```

To start the backend server:
```bash
uvicorn main:app --reload
```
*Server will start at `http://localhost:8000`*

### 3. Frontend Setup
The frontend delivers the interactive UI.

```bash
# Open a new terminal tab and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*Application will start at `http://localhost:5173`*

---

## 📖 Usage Guide

1.  **Home Dashboard**: Navigate through the clean, cyber-aesthetic dashboard to access different modules (Scheduling, Primitives, Problems, Dangers).
2.  **Scheduling**:
    -   Enter process details (PID, Arrival, Burst, Priority).
    -   Select an algorithm from the dropdown.
    -   Click **"Simulate"** to view the Gantt Chart and metrics.
    -   Check "AI Analysis" for deeper insights.
3.  **Visualizations**:
    -   Use the **"Add Actor"** buttons (e.g., Add Reader, Add Philosopher) to populate simulations.
    -   Observe real-time state changes (Waiting vs. Active).
    -   Toggle "Strategies" (e.g., Reader vs. Writer preference) to see how logic changes behavior.

---

## 📂 Project Structure

```
OS_Lab_Part_B/
├── backend/            # FastAPI Server
│   ├── main.py        # API Entry point & Routes
│   ├── scheduler.py   # Scheduling Algorithms (FCFS, SJF, etc.)
│   ├── ai_analysis.py # LangChain + Groq integration
│   └── requirements.txt
├── frontend/           # React Client
│   ├── src/
│   │   ├── components/# Reusable UI & Visualizations
│   │   │   └── visualizations/ # All OS Vis Logic (Mutex, Semaphore, etc.)
│   │   ├── pages/     # Main Route Pages
│   │   ├── data/      # Static data & Helper functions
│   │   └── App.jsx    # Routing Setup
│   └── package.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
