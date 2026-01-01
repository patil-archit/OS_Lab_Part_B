from typing import List, Dict

def fcfs(processes: List[Dict]):
    # Sort by arrival time
    processes.sort(key=lambda x: x['arrivalTime'])
    
    current_time = 0
    schedule = []
    
    for p in processes:
        if current_time < p['arrivalTime']:
            current_time = p['arrivalTime']
            
        start_time = current_time
        end_time = start_time + p['burstTime']
        
        schedule.append({
            "pid": p['pid'],
            "start": start_time,
            "end": end_time,
            "duration": p['burstTime']
        })
        
        current_time = end_time
        
    return schedule

def sjf(processes: List[Dict]):
    # Non-preemptive SJF
    # Sort by arrival, then burst? No.
    # Logic: At any time t, pick process with shortest burst among those arrived.
    
    processes.sort(key=lambda x: x['arrivalTime'])
    n = len(processes)
    completed = 0
    current_time = 0
    schedule = []
    is_completed = [False] * n
    
    while completed != n:
        # Find candidates
        candidates = []
        for i in range(n):
            if processes[i]['arrivalTime'] <= current_time and not is_completed[i]:
                candidates.append((processes[i]['burstTime'], i))
        
        if not candidates:
            current_time = processes[completed]['arrivalTime'] # Jump to next arrival? Not guaranteed sorted by index if we mutate.
            # Better: Jump to min arrival of incomplete
            min_arr = float('inf')
            for i in range(n):
                if not is_completed[i]:
                    min_arr = min(min_arr, processes[i]['arrivalTime'])
            current_time = max(current_time, min_arr)
            continue
            
        # Pick shortest burst
        candidates.sort()
        burst, idx = candidates[0]
        p = processes[idx]
        
        start_time = current_time
        end_time = start_time + burst
        
        schedule.append({
            "pid": p['pid'],
            "start": start_time,
            "end": end_time,
            "duration": burst
        })
        
        is_completed[idx] = True
        completed += 1
        current_time = end_time
        
    return schedule

def priority_sched(processes: List[Dict]):
    # Non-preemptive Priority (Lower number = Higher priority)
    n = len(processes)
    completed = 0
    current_time = 0
    schedule = []
    is_completed = [False] * n
    
    while completed != n:
        candidates = []
        for i in range(n):
            if processes[i]['arrivalTime'] <= current_time and not is_completed[i]:
                candidates.append((processes[i]['priority'], i))
                
        if not candidates:
            # Jump time
            min_arr = float('inf')
            for i in range(n):
                if not is_completed[i]:
                    min_arr = min(min_arr, processes[i]['arrivalTime'])
            current_time = max(current_time, min_arr)
            continue
            
        candidates.sort() # Sort by priority
        prio, idx = candidates[0]
        p = processes[idx]
        
        start_time = current_time
        end_time = start_time + p['burstTime']
        
        schedule.append({
            "pid": p['pid'],
            "start": start_time,
            "end": end_time,
            "duration": p['burstTime']
        })
        
        is_completed[idx] = True
        completed += 1
        current_time = end_time

    return schedule
    
def round_robin(processes: List[Dict], quantum: int):
    # Preemptive RR
    processes.sort(key=lambda x: x['arrivalTime'])
    
    # Ready Queue
    queue = []
    current_time = 0
    schedule = []
    
    # Track remaining burst
    rem_burst = {p['pid']: p['burstTime'] for p in processes}
    
    # Helper to add arrived processes
    # We need to manage arriving processes carefully.
    
    # Easy implementation: Simulation loop
    time_limit = sum(p['burstTime'] for p in processes) + max(p['arrivalTime'] for p in processes) + 100 # Safety
    
    # Queue stores PID
    active_pid = None
    processed_count = 0
    n = len(processes)
    
    # We need a proper queue management logic
    # Re-impl: time step is tricky for viz. Chunk based logic is better.
    
    # Standard RR Logic
    queue = []
    visited = [False] * n
    
    # Add initial
    if n > 0:
        current_time = processes[0]['arrivalTime']
    
    # Push all who arrived at 0 (or min arrival)
    for i in range(n):
        if processes[i]['arrivalTime'] <= current_time:
            queue.append(i)
            visited[i] = True
            
    while queue:
        idx = queue.pop(0)
        p = processes[idx]
        pid = p['pid']
        
        burst = rem_burst[pid]
        
        exec_time = min(quantum, burst)
        
        start_time = current_time
        end_time = current_time + exec_time
        
        schedule.append({
            "pid": pid,
            "start": start_time,
            "end": end_time,
            "duration": exec_time
        })
        
        rem_burst[pid] -= exec_time
        current_time = end_time
        
        # Check for new arrivals during this execution
        for i in range(n):
            if not visited[i] and processes[i]['arrivalTime'] <= current_time:
                queue.append(i)
                visited[i] = True
                
        # If not finished, re-queue
        if rem_burst[pid] > 0:
            queue.append(idx)
            
        # If queue empty but processes remaining (gap in arrival)
        if not queue and any(not v for v in visited):
             # Fast forward
             for i in range(n):
                 if not visited[i]:
                     current_time = processes[i]['arrivalTime']
                     queue.append(i)
                     visited[i] = True
                     break
                     
    return schedule

def calculate_metrics(schedule, processes):
    # Turnaround = Completion - Arrival
    # Waiting = Turnaround - Burst
    metrics = {}
    
    # Find completion times
    completion_times = {}
    for block in schedule:
        pid = block['pid']
        completion_times[pid] = max(completion_times.get(pid, 0), block['end'])
        
    total_wait = 0
    total_turnaround = 0
    
    process_map = {p['pid']: p for p in processes}
    
    results = []
    
    for pid, comp_time in completion_times.items():
        arr = process_map[pid]['arrivalTime']
        burst = process_map[pid]['burstTime']
        
        turnaround = comp_time - arr
        waiting = turnaround - burst
        
        total_wait += waiting
        total_turnaround += turnaround
        
        results.append({
            "pid": pid,
            "completion": comp_time,
            "turnaround": turnaround,
            "waiting": waiting
        })
        
    avg_wait = total_wait / len(processes) if processes else 0
    avg_turnaround = total_turnaround / len(processes) if processes else 0
    
    return {
        "details": results,
        "averageWaiting": avg_wait,
        "averageTurnaround": avg_turnaround,
        "utilization": 100 # simplified
    }
