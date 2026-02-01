import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    # Fallback / Warn
    print("WARNING: GROQ_API_KEY not found in environment.")

llm = ChatGroq(
    temperature=0,
    groq_api_key=api_key,
    model_name="llama-3.3-70b-versatile" 
)

# --- PROMPTS ---

fcfs_prompt = """
You are an OS Expert specializing in FCFS.
Analyze for "Convoy Effect".

Processes: {processes}
Metrics: {metrics}

Output Rules:
- Format: Markdown Bullet Points.
- Style: Professional, insightful, concise. Avoid text walls.
- Max Length: 6-8 lines.
- Content: meaningful analysis of *why* a risk exists.

Task:
1. Identify Convoy Effect risk (Short jobs waiting behind long ones?).
2. Risk Score: Low/Medium/High.
3. Brief Summary.
"""

sjf_prompt = """
You are an OS Expert specializing in SJF.
Analyze for Starvation of Long Processes.

Processes: {processes}
Metrics: {metrics}

Output Rules:
- Format: Markdown Bullet Points.
- Style: Professional, insightful, concise. Avoid text walls.
- Max Length: 6-8 lines.
- Content: meaningful analysis of *why* a risk exists.

Task:
1. Identify Starvation risk for long burst jobs.
2. Risk Score: Low/Medium/High.
3. Brief Summary.
"""

rr_prompt = """
You are an OS Expert specializing in Round Robin.
Analyze Time Quantum efficiency (Quantum = {quantum}).

Processes: {processes}
Metrics: {metrics}

Output Rules:
- Format: Markdown Bullet Points.
- Style: Professional, insightful, concise. Avoid text walls.
- Max Length: 6-8 lines.
- Content: meaningful analysis of *why* a risk exists.

Task:
1. Evaluate if Quantum ({quantum}) fits Burst Times (Too large = FCFS, Too small = Overhead).
2. IGNORE Priority.
3. Risk Score: Low/Medium/High (based on responsiveness).
4. Brief Summary.
"""

priority_prompt = """
You are an OS Expert specializing in Priority Scheduling.
Analyze for Starvation.

Processes: {processes}
Metrics: {metrics}

Output Rules:
- Format: Markdown Bullet Points.
- Style: Professional, insightful, concise. Avoid text walls.
- Max Length: 6-8 lines.
- Content: meaningful analysis of *why* a risk exists.

Task:
1. Identify Starvation risk for low priority jobs.
2. Risk Score: Low/Medium/High.
3. Brief Summary.
"""

# Map algorithm names (from frontend) to prompts
PROMPT_MAP = {
    "fcfs": fcfs_prompt,
    "sjf": sjf_prompt,
    "round_robin": rr_prompt,
    "priority": priority_prompt
}

def analyze_schedule(processes, algorithm, metrics, quantum=None):
    """
    Uses Groq to analyze the schedule using a specialized prompt for the algorithm.
    """
    if not api_key:
        return "AI Analysis Unavailable: Missing API Key."
        
    # Select the specific prompt or fallback to FCFS if unknown
    selected_template = PROMPT_MAP.get(algorithm, fcfs_prompt)
    
    system = "You are an Operating System Expert AI. Output in Markdown."
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", selected_template)
    ])
    
    chain = prompt | llm
    
    try:
        # Prepare inputs, only adding quantum if it exists (mostly for RR)
        inputs = {
            "processes": str(processes),
            "metrics": str(metrics)
        }
        if quantum is not None:
            inputs["quantum"] = str(quantum)
            
        response = chain.invoke(inputs)
        return response.content
    except Exception as e:
        return f"AI Analysis Failed: {str(e)}"

# --- ORACLE ---

oracle_prompt = """
You are "The Oracle", an enlightened Operating System Scheduler.
Your task is to PREDICT the best scheduling algorithm for the given set of processes.

Processes: {processes}

Available Algorithms:
1. FCFS (First-Come, First-Served)
2. SJF (Shortest Job First) - Ideal for minimizing waiting time.
3. Round Robin (Time Quantum = 2-4) - Ideal for responsiveness/fairness.
4. Priority Scheduling - Ideal if distinct priorities exist.

Output Rules:
- Format: JSON object (strictly).
- Structure: {{ "recommended_algorithm": "fcfs" | "sjf" | "round_robin" | "priority", "reasoning": "Brief, mystical but technical explanation." }}
- Style: Wise, slightly mystical ("I foresee..."), but technically grounded.

Task:
1. Analyze process characteristics (Burst times, Arrival times, Priorities).
2. Recommend the single best algorithm to optimize Average Waiting Time or Fairness.
3. Return ONLY the JSON.
"""

def consult_oracle(processes):
    """
    Asks the AI to predict the best algorithm.
    """
    if not api_key:
        return {"recommended_algorithm": "fcfs", "reasoning": "The Oracle is silent (Missing API Key)."}
        
    system = "You are The Oracle, an OS Scheduling Expert. Output strictly in JSON."
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", oracle_prompt)
    ])
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "processes": str(processes)
        })
        # Basic cleanup to ensure JSON parsing if LLM adds markdown
        content = response.content.replace("```json", "").replace("```", "").strip()
        import json
        return json.loads(content)
    except Exception as e:
        return {"recommended_algorithm": "fcfs", "reasoning": f"The Oracle is clouded: {str(e)}"}
