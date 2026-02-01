from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import scheduler
import ai_analysis

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Process(BaseModel):
    pid: int
    arrivalTime: int
    burstTime: int
    priority: int = 0

class SimulationRequest(BaseModel):
    algorithm: str
    quantum: int = 2
    processes: List[Process]

@app.get("/")
def read_root():
    return {"message": "OS Simulator Backend Active"}

@app.post("/api/simulate")
def run_simulation(req: SimulationRequest):
    # Convert Pydantic models to dicts for helper functions
    proc_list = [p.dict() for p in req.processes]
    
    # 1. Run Schedule
    schedule = []
    if req.algorithm == "fcfs":
        schedule = scheduler.fcfs(proc_list)
    elif req.algorithm == "sjf":
         schedule = scheduler.sjf(proc_list)
    elif req.algorithm == "round_robin":
         schedule = scheduler.round_robin(proc_list, req.quantum)
    elif req.algorithm == "priority":
         schedule = scheduler.priority_sched(proc_list)
    else:
        raise HTTPException(status_code=400, detail="Unknown algorithm")
        
    # 2. Calculate Metrics
    metrics = scheduler.calculate_metrics(schedule, proc_list)
    
    # 3. AI Analysis
    ai_risk = ai_analysis.analyze_schedule(proc_list, req.algorithm, metrics, quantum=req.quantum)
    
    return {
        "schedule": schedule,
        "metrics": metrics,
        "aiAnalysis": ai_risk
    }

class OracleRequest(BaseModel):
    processes: List[Process]

@app.post("/api/oracle")
def ask_oracle(req: OracleRequest):
    # Convert Pydantic models to dicts
    proc_list = [p.dict() for p in req.processes]
    
    recommendation = ai_analysis.consult_oracle(proc_list)
    
    return recommendation
