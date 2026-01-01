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

def analyze_schedule(processes, algorithm, metrics):
    """
    Uses Groq to analyze the schedule for risks.
    """
    if not api_key:
        return "AI Analysis Unavailable: Missing API Key."
        
    system = "You are an Operating System Expert AI. User provides process data and scheduling results. You must analyze specific risks."
    human = """
    Analyze the following Process Schedule for risks of Starvation and Race Conditions (if applicable context exists).
    
    Algorithm: {algorithm}
    
    Processes:
    {processes}
    
    Metrics:
    {metrics}
    
    Task:
    1. Identify if Starvation is occurring (e.g., low priority processes waiting too long).
    2. Provide a 'Risk Score' (Low/Medium/High).
    3. Give a concise, professional summary for a Dashboard.
    
    Keep response brief, markdown formatted.
    """
    
    prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "algorithm": algorithm,
            "processes": str(processes),
            "metrics": str(metrics)
        })
        return response.content
    except Exception as e:
        return f"AI Analysis Failed: {str(e)}"
