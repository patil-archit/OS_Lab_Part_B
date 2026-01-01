import { Calendar, Clock, BarChart, ArrowRight } from 'lucide-react';
import SchedulingSimulation from '../components/visualizations/SchedulingSimulation';

export const schedulingAlgorithms = [
  {
    id: "fcfs",
    title: "First-Come, First-Served",
    subtitle: "Non-Preemptive",
    icon: Calendar,
    description: "The simplest scheduling algorithm. Processes are executed in the exact order they arrive, like customers in a grocery store line.",
    visualization: SchedulingSimulation,
    content: `
      <h3 class="text-2xl font-bold mb-4">The Queue Logic</h3>
      <p class="mb-6 leading-relaxed">
        <strong>First-Come, First-Served (FCFS)</strong> is logically equivalent to a FIFO (First-In, First-Out) queue. It is the most intuitive scheduling algorithm: the first process that requests the CPU gets the CPU. The processor executes the process until it finishes (or gets blocked), and only then does it move to the next process in the queue.
      </p>
      
      <h3 class="text-2xl font-bold mb-4">Real-World Analogy</h3>
      <p class="mb-6 leading-relaxed">
        Imagine buying tickets at a cinema box office. People stand in a line. The ticket seller serves the person at the front. Even if the person at the front takes 10 minutes to decide on a seat, everyone behind them must wait. A person who just wants to ask a 5-second question must wait for the entire line to clear.
      </p>

      <h3 class="text-2xl font-bold mb-4">Deep Dive: The Convoy Effect</h3>
      <p class="mb-6 leading-relaxed">
        The major downside of FCFS is the <strong>Convoy Effect</strong>. This happens when a few slow processes (CPU-bound) clog up the front of the line, forcing many fast processes (I/O-bound) to wait.
      </p>
      <div class="bg-gray-100 p-6 rounded-2xl border border-gray-200 mb-8 font-mono text-sm leading-loose">
         <strong>Scenario:</strong><br/>
         P1 (Burst: 100ms) arrives at t=0<br/>
         P2 (Burst: 1ms) arrives at t=1<br/>
         <br/>
         <strong>FCFS Schedule:</strong><br/>
         [ P1 .................................................. ] [P2]<br/>
         0 --------------------------------------------------> 100 -> 101<br/>
         <br/>
         <strong>Result:</strong> P2 waits 99ms for a 1ms job! Average wait time skyrockets.
      </div>
      
      <h3 class="text-2xl font-bold mb-4">Characteristics</h3>
      <ul class="list-disc list-inside space-y-2 mb-8 text-ink/80">
        <li><strong>Non-Preemptive:</strong> Once a process starts, it keeps the CPU until done.</li>
        <li><strong>Simple:</strong> Easy to implement (just a queue).</li>
        <li><strong>Fairness:</strong> "Fair" in the sense that arrival order determines execution, but "Unfair" to short jobs generally.</li>
        <li><strong>Throughput:</strong> Can be low if long jobs block short ones.</li>
      </ul>
    `
  },
  {
    id: "sjf",
    title: "Shortest Job First",
    subtitle: "Optimal / Non-Preemptive",
    icon: Clock,
    description: "Selects the waiting process with the smallest execution time to execute next. Mathematically optimal for minimizing average wait time.",
    visualization: SchedulingSimulation,
    content: `
      <h3 class="text-2xl font-bold mb-4">Minimizing the Wait</h3>
      <p class="mb-6 leading-relaxed">
         <strong>Shortest Job First (SJF)</strong> is a scheduling policy that selects the waiting process with the smallest execution time to execute next. By getting short jobs out of the way quickly, it significantly reduces the average waiting time for everyone.
      </p>
      
      <h3 class="text-2xl font-bold mb-4">Why is it Optimal?</h3>
      <p class="mb-6 leading-relaxed">
         SJF is provably optimal for minimizing the <strong>average waiting time</strong> for a given set of processes. Think about it: if you have a 1-minute task and a 1-hour task, doing the 1-minute task first means the total wait time is just 1 minute (for the long task). Doing the 1-hour task first means the total wait time is 60 minutes (for the short task).
      </p>

      <div class="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
         <h4 class="font-bold text-blue-900 mb-2">The Impossible Challenge</h4>
         <p class="text-blue-800/80">
            The fundamental flaw of SJF is that <strong>we don't know the future</strong>. An Operating System cannot know exactly how long a process will take before running it. In real systems, we rely on <em>prediction methods</em> (like exponential averaging of previous bursts) to guess the next burst duration.
         </p>
      </div>
      
      <h3 class="text-2xl font-bold mb-4">Risk: Starvation</h3>
      <p class="mb-6 leading-relaxed">
        While efficient, SJF suffers from a fatal flaw: <strong>Starvation</strong>. If short processes keep arriving, a long process might never get the CPU. It will sit in the ready queue forever, constantly being bumped by shorter newcomers.
      </p>
    `
  },
  {
    id: "round_robin",
    title: "Round Robin",
    subtitle: "Preemptive / Time-Shared",
    icon: ArrowRight,
    description: "Each process gets a small unit of CPU time (time quantum). Modern desktop systems use this to create the illusion of multitasking.",
    visualization: SchedulingSimulation,
    content: `
      <h3 class="text-2xl font-bold mb-4">The Illusion of Parallelism</h3>
      <p class="mb-6 leading-relaxed">
         <strong>Round Robin (RR)</strong> is designed specifically for time-sharing systems. It is similar to FCFS, but with preemption added to switch between processes. A small unit of time, called a <strong>Time Quantum</strong> (or Time Slice), is defined.
      </p>
      <p class="mb-6 leading-relaxed">
         The ready queue is treated as a circular queue. The scheduler goes around the ready queue, allocating the CPU to each process for a time interval of up to 1 time quantum.
      </p>

      <h3 class="text-2xl font-bold mb-4">The Importance of Quantum Size</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <h4 class="font-bold mb-2 text-red-500">Too Small</h4>
            <p className="text-sm opacity-70">If the quantum is extremely small (e.g., 1ms), the overhead of context switching becomes huge. The CPU spends more time switching between processes than actually running them.</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <h4 class="font-bold mb-2 text-green-600">Too Large</h4>
            <p className="text-sm opacity-70">If the quantum is very large, RR degenerates into FCFS. Responsive interaction is lost because a process holds the CPU for too long.</p>
        </div>
      </div>
      
      <h3 class="text-2xl font-bold mb-4">Analogy</h3>
      <p class="mb-6 leading-relaxed">
        Imagine a chess master playing 10 opponents at once. They make a move on Board 1, then immediately move to Board 2, then Board 3, and so on. To each opponent, it feels like the master is playing them continuously, but somewhat slower. This is how your computer runs your Browser, Music Player, and Code Editor "at the same time" on a single core.
      </p>
    `
  },
  {
    id: "priority",
    title: "Priority Scheduling",
    subtitle: "Preemptive / Non-Preemptive",
    icon: BarChart,
    description: "Processes are executed based on priority. Important tasks (like system kernels) run before user tasks.",
    visualization: SchedulingSimulation,
    content: `
      <h3 class="text-2xl font-bold mb-4">First Things First</h3>
      <p class="mb-6 leading-relaxed">
         In <strong>Priority Scheduling</strong>, a priority number (integer) is associated with each process. The CPU is allocated to the process with the highest priority. In this simulator, we use the convention where <strong>Lower Number = Higher Priority</strong> (e.g., Priority 1 is more important than Priority 10).
      </p>
      
      <h3 class="text-2xl font-bold mb-4">Types of Priority</h3>
      <ul class="list-disc list-inside space-y-4 mb-8 text-ink/80 bg-gray-50 p-6 rounded-2xl border border-black/5">
        <li><strong>Static Priority:</strong> Assigned at creation time. Example: System processes > User processes.</li>
        <li><strong>Dynamic Priority:</strong> Changed by the OS at runtime to achieve system goals (e.g., increasing priority of a process that has waited a long time).</li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">The Starvation Problem</h3>
      <p class="mb-6 leading-relaxed">
         A major problem with priority scheduling is <strong>indefinite blocking</strong> or <strong>starvation</strong>. A process that is ready to run but waiting for the CPU can be considered blocked. A priority scheduling algorithm can leave some low-priority processes waiting indefinitely if a steady stream of higher-priority processes keeps arriving.
      </p>
      
      <h3 class="text-2xl font-bold mb-4">The Solution: Aging</h3>
      <p class="mb-6 leading-relaxed">
         Aging is a technique of gradually increasing the priority of processes that wait in the system for a long time. For example, if priorities range from 127 (low) to 0 (high), we could decrease the priority value of a waiting process by 1 every 15 minutes. Eventually, even the lowliest job will become the highest priority job in the system and will execute.
      </p>
    `
  }
];
