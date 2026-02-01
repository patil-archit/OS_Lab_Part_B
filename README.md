# 🧠 OS Simulator & Visualizer

> **"Bridging the Gap Between Abstract OS Theory and Concrete Implementation"**

An interactive, full-stack pedagogical tool designed to visualize complex **Operating System algorithms**. By combining a high-performance **FastAPI** backend with a dynamic **React** frontend, this project brings theoretical concepts like Process Scheduling, Deadlocks, and Concurrency into the visual realm.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![AI](https://img.shields.io/badge/AI-Groq_Llama_3-purple?logo=openai)

---

## 📚 Core Operating System Concepts

This project is not just a simulator; it is a deep dive into the kernels of modern computing. We dissect and visualize:

### 1. CPU Scheduling Algorithms ⏱️
The heart of any OS. We simulate how a single CPU core multiplexes between multiple processes.
- **FCFS (First-Come, First-Served)**: The simplest queue-based approach. We visualize the *Convoy Effect*.
- **SJF (Shortest Job First)**: Optimizing for waiting time. We highlight potential *Starvation* of long jobs.
- **Round Robin**: The standard for time-sharing systems. We analyze the impact of *Time Quantum* on Context Switch overhead vs. Responsiveness.
- **Priority Scheduling**: Managing critical tasks. We demonstrate *Preemption* and priority inversion risks.

### 2. Concurrency & Synchronization 🚦
Visualizing the dangerous dance of threaded execution.
- **The Reader-Writer Problem**: Managing access to a shared database. Visualized with a **Circular Wait Queue** to show fairness/starvation.
- **Mutex Locks**: Binary semaphores in action, ensuring mutual exclusion in critical sections.
- **Semaphores**: Counting semaphores for resource management.
- **Race Conditions**: What happens when locking fails? We simulate data corruption in real-time.
- **Deadlock**: Visualizing the "Dining Philosophers" problem and the 4 conditions necessary for deadlock (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait).

### 3. Memory Management (Upcoming) 💾
- Paging, Segmentation, and Virtual Memory visualization.

---

## 🔮 AI-Powered Analysis ("The Oracle")

We integrate **Large Language Models (Groq/Llama-3)** to provide intelligent insights, not just raw data.

- **The Oracle**: A predictive agent that analyzes your process list *before* execution and recommends the optimal algorithm (e.g., "Use SJF to minimize average wait time for this batch").
- **Risk Analysis Agent**: Post-simulation analysis that flags theoretical risks:
    - *Convoy Effect* detection in FCFS.
    - *Starvation* warnings in Priority/SJF.
    - *Quantum Efficiency* checks in Round Robin.

---

## 🛠️ Technical Architecture

This project exemplifies modern **Agentic Workflow** and **Full-Stack Engineering**:

### Backend (`/backend`)
- **FastAPI**: Chosen for its high performance and native async support, essential for non-blocking simulation handling.
- **LangChain + Groq**: Powers the AI analysis agents. We use optimized prompts for specific algorithmic contexts.
- **Pydantic**: Enforces strict typing for Process Control Blocks (PCBs) and simulation metrics.

### Frontend (`/frontend`)
- **React 19 + Vite**: utilized for high-performance rendering.
- **Framer Motion**: extensive use for rigid body physics simulations and smooth transitions (e.g., processes entering/leaving the CPU).
- **Tailwind CSS**: Implementing a clean, "Apple-esque" design system with glassmorphism and modern typography.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- A [Groq API Key](https://console.groq.com/) for AI features.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/os-simulator.git
   cd os-simulator
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   
   # Setup Environment
   echo "GROQ_API_KEY=your_key_here" > .env
   
   # Run Server
   uvicorn main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the App**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👨‍💻 Contributing

We welcome contributions that deepen the OS concepts or improve the visualizations.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Built with ❤️ for CS Students and OS Enthusiasts.*
