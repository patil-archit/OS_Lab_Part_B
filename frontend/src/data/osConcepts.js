import MutexVis from '../components/visualizations/MutexVis';
import SemaphoreVis from '../components/visualizations/SemaphoreVis';
import DeadlockVis from '../components/visualizations/DeadlockVis';
import StarvationVis from '../components/visualizations/StarvationVis';
import RaceConditionVis from '../components/visualizations/RaceConditionVis';
import { Lock, Signal, Shield, Monitor, Zap, Timer, AlertTriangle } from 'lucide-react';

export const primitivesData = [
  {
    id: "mutexes",
    title: "Mutexes",
    subtitle: "Binary Exclusion",
    icon: Lock,
    description: "A fundamental locking mechanism that ensures fundamental mutual exclusion: only one thread often accesses a critical section at a time.",
    visualization: MutexVis,
    content: `
      <h3 class="text-2xl font-bold mb-4">The Concept of Mutual Exclusion</h3>
      <p class="mb-6 leading-relaxed">
        A <strong>Mutex</strong> (short for Mutual Exclusion object) is a synchronization primitive that grants exclusive access to a shared resource. Think of it as a physical key to a single-person restroom. If the door is unlocked, you enter and lock it. If someone else arrives while you are inside, they find the door locked and must wait outside until you leave and unlock the door.
      </p>

      <h3 class="text-2xl font-bold mb-4">How It Works</h3>
      <ul class="list-disc list-inside space-y-2 mb-8 text-ink/80">
        <li><strong>Lock (Acquire):</strong> A thread attempts to take the lock. If available, it succeeds and proceeds. If not, it blocks (sleeps).</li>
        <li><strong>Critical Section:</strong> The code that accesses the shared resource (e.g., writing to a file, updating a bank balance).</li>
        <li><strong>Unlock (Release):</strong> The thread leaves the critical section and releases the lock, waking up waiting threads.</li>
      </ul>

      <div class="bg-gray-50 border-l-4 border-gray-900 p-6 rounded-r-xl mb-8">
        <h4 class="font-bold mb-2">Key Properties</h4>
        <ul class="space-y-1 text-sm">
             <li><strong>Ownership:</strong> A mutex typically has an owner. Only the thread that locked the mutex can unlock it.</li>
             <li><strong>Reentrancy:</strong> Some mutexes are recursive, allowing the same thread to lock it multiple times (as long as it unlocks it an equal number of times).</li>
        </ul>
      </div>

      <h3 class="text-2xl font-bold mb-4">Common Pitfalls</h3>
      <p class="mb-6 leading-relaxed">
        The most common error is forgetting to unlock the mutex (e.g., if an exception is thrown in the critical section), leading to a permanently locked resource. This is why RAII (Resource Acquisition Is Initialization) patterns or <code>try-finally</code> blocks are crucial.
      </p>
    `
  },
  {
    id: "semaphores",
    title: "Semaphores",
    subtitle: "Signaling Mechanisms",
    icon: Signal,
    description: "A generalized signaling mechanism that controls access to a common resource by multiple processes using a counter.",
    visualization: SemaphoreVis,
    content: `
      <h3 class="text-2xl font-bold mb-4">The Generalized Lock</h3>
      <p class="mb-6 leading-relaxed">
        Proposed by Edsger Dijkstra in 1965, a <strong>Semaphore</strong> is a non-negative integer variable that can only be accessed via two atomic operations: <code>P</code> (Wait/Decrement) and <code>V</code> (Signal/Increment).
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div class="bg-blue-50 p-6 rounded-2xl">
            <h4 class="font-bold text-blue-900 mb-2">Counting Semaphore</h4>
            <p class="text-sm text-blue-800/80">
                Used to control access to a pool of resources (e.g., a pool of 5 database connections). The counter is initialized to N. Up to N threads can pass; the (N+1)th thread will block.
            </p>
         </div>
         <div class="bg-purple-50 p-6 rounded-2xl">
            <h4 class="font-bold text-purple-900 mb-2">Binary Semaphore</h4>
            <p class="text-sm text-purple-800/80">
                Initialized to 1. Functionally similar to a Mutex, but without the concept of ownership. Thread A can acquire it, and Thread B can release it (used for signaling).
            </p>
         </div>
      </div>

      <h3 class="text-2xl font-bold mb-4">The Club Bouncer Analogy</h3>
      <p class="mb-6 leading-relaxed">
        Imagine a nightclub with a capacity of 50. The bouncer has a clicker counter. 
        <br/>
        1. <strong>Wait (P):</strong> When a guest arrives, if the count > 0, the bouncer decrements the count and lets them in. If count == 0, the guest waits in line.
        <br/>
        2. <strong>Signal (V):</strong> When a guest leaves, the bouncer increments the count. If there are people waiting in line, one is let in.
      </p>
    `
  },
  {
    id: "locks",
    title: "Spinlocks & Latches",
    subtitle: "Busy Waiting",
    icon: Shield,
    description: "Low-level synchronization mechanisms where threads loop repeatedly checking if a resource is available.",
    // No visualization as per request
    content: `
      <h3 class="text-2xl font-bold mb-4">To Sleep or To Spin?</h3>
      <p class="mb-6 leading-relaxed">
         When a thread cannot acquire a lock, it has two choices:
         <br/>
         1. <strong>Sleep (Context Switch):</strong> The OS moves the thread to a "blocked" queue and runs something else. This saves CPU but takes time (~microseconds) to switch. Standard Mutexes do this.
         <br/>
         2. <strong>Spin (Busy Wait):</strong> The thread runs a tight loop (<code>while(locked);</code>) checking the lock repeatedly. This burns CPU but reacts instantly. This is a <strong>Spinlock</strong>.
      </p>

      <h3 class="text-2xl font-bold mb-4">When to use Spinlocks?</h3>
      <div class="bg-orange-50 p-6 rounded-2xl border border-orange-100 mb-8">
        <p class="text-orange-900 mb-4">
            Spinlocks are useful in <strong>Multiprocessor Systems</strong> where the critical section is extremely short (shorter than the time it takes to context switch).
        </p>
        <p class="text-orange-900 font-bold">
            Warning: Ideally, never hold a spinlock for long. If the thread holding the lock is preempted, all other spinning threads waste 100% CPU cycles doing nothing.
        </p>
      </div>
    `
  },
  {
    id: "monitors",
    title: "Monitors",
    subtitle: "High-Level Sync",
    icon: Monitor,
    description: "A synchronization construct that allows threads to have both mutual exclusion and the ability to wait (block) for a certain condition.",
    // No visualization as per request
    content: `
      <h3 class="text-2xl font-bold mb-4">Synchronization Made Safe</h3>
      <p class="mb-6 leading-relaxed">
        Using Semaphores and Mutexes manually is error-prone. A <strong>Monitor</strong> is a higher-level abstraction (often a language feature, like Java's <code>synchronized</code> keyword or Python's <code>threading.Condition</code>).
      </p>
      
      <h3 class="text-2xl font-bold mb-4">Anatomy of a Monitor</h3>
      <p class="mb-6 leading-relaxed">
        A Monitor consists of:
        <br/>
        1. <strong>Mutual Exclusion:</strong> Only one thread can be executing a method inside the monitor at any time. The compiler/VM handles the locking automatically.
        <br/>
        2. <strong>Condition Variables:</strong> Mechanism for threads to wait for a specific condition (e.g., "Buffer Not Empty"). They can <code>Wait()</code> (release lock and sleep) and <code>Notify()</code> (wake up a sleeper).
      </p>

      <div class="bg-gray-100 p-6 rounded-2xl border border-black/5 font-mono text-sm overflow-x-auto">
        <span class="text-blue-600">monitor</span> Resource {<br/>
        &nbsp;&nbsp;<span class="text-purple-600">condition</span> isFree;<br/>
        &nbsp;&nbsp;<span class="text-purple-600">boolean</span> busy = false;<br/><br/>
        &nbsp;&nbsp;<span class="text-blue-600">entry procedure</span> acquire() {<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-red-500">if</span> (busy) isFree.wait();<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;busy = true;<br/>
        &nbsp;&nbsp;}<br/><br/>
        &nbsp;&nbsp;<span class="text-blue-600">entry procedure</span> release() {<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;busy = false;<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;isFree.signal();<br/>
        &nbsp;&nbsp;}<br/>
        }
      </div>
    `
  }
];

export const dangersData = [
  {
    id: "deadlocks",
    title: "Deadlocks",
    subtitle: "System Freeze",
    icon: Zap,
    description: "A catastrophic situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.",
    visualization: DeadlockVis,
    content: `
      <h3 class="text-2xl font-bold mb-4">The Four Coffins of Deadlock</h3>
      <p class="mb-6 leading-relaxed">
        A Deadlock can <strong>only</strong> occur if these four conditions hold simultaneously (Coffman Conditions):
      </p>
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <li class="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
            <strong class="block text-red-600 mb-1">1. Mutual Exclusion</strong>
            Resources cannot be shared (must be exclusive).
        </li>
        <li class="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
            <strong class="block text-red-600 mb-1">2. Hold and Wait</strong>
            A process holding at least one resource is waiting to acquire additional resources held by others.
        </li>
        <li class="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
            <strong class="block text-red-600 mb-1">3. No Preemption</strong>
            A resource can be released only voluntarily by the process holding it.
        </li>
        <li class="bg-white p-4 rounded-xl border border-black/5 shadow-sm">
            <strong class="block text-red-600 mb-1">4. Circular Wait</strong>
            P1 waits for P2, P2 waits for P3, ... Pn waits for P1.
        </li>
      </ul>

      <h3 class="text-2xl font-bold mb-4">Handling Deadlocks</h3>
      <p class="mb-6 leading-relaxed">
        OS Designers have three strategies:
        <br/>
        1. <strong>Prevention:</strong> Design the system so at least one of the 4 conditions cannot happen (e.g., mandate acquiring all locks at once).
        <br/>
        2. <strong>Avoidance:</strong> Use smart algorithms like the <strong>Banker's Algorithm</strong> to deny requests that <em>might</em> lead to an unsafe state.
        <br/>
        3. <strong>Detection & Recovery:</strong> Let deadlocks happen, run an algorithm to detect cycles, and kill a victim process to break the cycle (common in Databases).
        <br/>
        4. <strong>Ostrich Algorithm:</strong> Pretend the problem doesn't exist (used by Unix/Windows! If your PC freezes, you just reboot).
      </p>
    `
  },
  {
    id: "starvation",
    title: "Starvation",
    subtitle: "Indefinite Blocking",
    icon: Timer,
    description: "A scenario where a process is perpetually denied necessary resources to process its work, usually due to low priority.",
    visualization: StarvationVis,
    content: `
      <h3 class="text-2xl font-bold mb-4">The Priority Trap</h3>
      <p class="mb-6 leading-relaxed">
        <strong>Starvation</strong> (or indefinite blocking) is distinct from Deadlock. In a deadlock, nobody moves. In starvation, the system is moving (high priority tasks are finishing), but the victim (low priority task) is stuck waiting forever.
      </p>
      
      <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-xl mb-8">
         <h4 class="font-bold mb-2">Real World Example</h4>
         <p>
            Imagine a busy printer shared by a CEO (Priority 1) and interns (Priority 10). The rule is "Highest Priority First". If CEOs keep sending documents non-stop, the intern's document will sit in the queue forever, gathering dust.
         </p>
      </div>

      <h3 class="text-2xl font-bold mb-4">The Fix: Aging</h3>
      <p class="mb-6 leading-relaxed">
         The standard solution is <strong>Aging</strong>: gradually increasing the priority of processes that have waited a long time. Eventually, the intern's document becomes Priority 0 and preempts the CEO.
      </p>
    `
  },
  {
    id: "race-conditions",
    title: "Race Conditions",
    subtitle: "Data Corruption",
    icon: AlertTriangle,
    description: "An undesirable situation where the system's substantive behavior is dependent on the sequence or timing of other uncontrollable events.",
    visualization: RaceConditionVis,
    content: `
      <h3 class="text-2xl font-bold mb-4">The Million Dollar Bug</h3>
      <p class="mb-6 leading-relaxed">
        A <strong>Race Condition</strong> happens when multiple threads access shared data concurrently, and at least one of them modifies it. Because the thread scheduling algorithm can switch threads at any instruction, the order of execution is non-deterministic.
      </p>

      <div class="bg-gray-900 text-white p-6 rounded-2xl font-mono text-sm mb-8">
        // Expected: count = 2<br/>
        // Initial: count = 0<br/>
        <br/>
        Thread A: temp = count (0)<br/>
        Thread B: temp = count (0) // Context Switch!<br/>
        Thread B: count = temp + 1 (1)<br/>
        Thread A: count = temp + 1 (1) // Writes over B's work!<br/>
        <br/>
        // Result: count = 1 (Lost Update)
      </div>

      <h3 class="text-2xl font-bold mb-4">Therac-25 Disaster</h3>
      <p class="mb-6 leading-relaxed">
         One of the most famous race conditions in history occurred in the Therac-25 radiation therapy machine (1980s). A race condition between user input and the machine settings allowed the machine to deliver massive, lethal overdoses of radiation to patients if the operator typed "too fast". It is a stark reminder that concurrency bugs can be deadly.
      </p>
    `
  }
];
