import { Utensils, Box, BookOpen, Layers } from 'lucide-react';
import ProducerConsumerVis from '../components/visualizations/ProducerConsumerVis';
import ReaderWriterVis from '../components/visualizations/ReaderWriterVis';
import DiningPhilosophersVis from '../components/visualizations/DiningPhilosophersVis';

export const classicProblems = [
   {
      id: "dining-philosophers",
      title: "Dining Philosophers",
      subtitle: "Resource Hierarchy",
      icon: Utensils,
      description: "A classic synchronization problem illustrating the challenges of allocating limited resources among a group of processes in a deadlock-free and starvation-free manner.",
      visualization: DiningPhilosophersVis,
      content: `
      <h3 class="text-2xl font-bold mb-4">The Setup</h3>
      <p class="mb-6 leading-relaxed">
         Five silent philosophers sit at a round table with bowls of spaghetti. Forks are placed between each pair of adjacent philosophers. 
         <br/>
         Each philosopher must alternately <strong>Think</strong> and <strong>Eat</strong>. However, a philosopher can only eat spaghetti when they have both left and right forks. Each fork can be held by only one philosopher and so a philosopher can use the fork only if it is not being used by another philosopher.
      </p>

      <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-8">
        <h4 class="font-bold text-red-900 mb-2">The Deadlock Trap</h4>
        <p class="text-red-800/80">
            If every philosopher simultaneously picks up their left fork, they will all wait forever for their right fork (which is held by their neighbor). The system deadlocks.
        </p>
      </div>

      <h3 class="text-2xl font-bold mb-4">Solutions</h3>
      <ul class="list-disc list-inside space-y-4 mb-8 text-ink/80">
        <li><strong>Resource Hierarchy:</strong> Force an ordering. Always pick up the lower-numbered fork first. This breaks the circular dependency (Coffman Condition #4).</li>
        <li><strong>The Waiter (Monitor):</strong> Introduce a waiter (arbitrator). Philosophers must ask the waiter for permission to eat. The waiter only gives permission if both forks are free.</li>
        <li><strong>Limit Concurrency:</strong> Allow only 4 philosophers at the table of 5 seats. At least one will always be guaranteed two forks.</li>
      </ul>
    `
   },
   {
      id: "producer-consumer",
      title: "Producer-Consumer",
      subtitle: "Bounded Buffer",
      icon: Box,
      description: "Also known as the Bounded-Buffer problem. It describes two processes, the producer and the consumer, who share a common, fixed-size buffer used as a queue.",
      visualization: ProducerConsumerVis,
      content: `
      <h3 class="text-2xl font-bold mb-4">The Problem</h3>
      <p class="mb-6 leading-relaxed">
         The <strong>Producer</strong>'s job is to generate data, put it into the buffer, and start again. At the same time, the <strong>Consumer</strong> is consuming the data (i.e., removing it from the buffer) one piece at a time.
         <br/><br/>
         <strong>Constraint:</strong> The buffer has a fixed size (N).
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div class="bg-yellow-50 p-6 rounded-2xl">
            <h4 class="font-bold text-yellow-900 mb-2">Overflow</h4>
            <p class="text-sm text-yellow-800/80">
                If the Producer is faster than the Consumer, the buffer fills up. The Producer must go to sleep (block) until there is an empty slot.
            </p>
         </div>
         <div class="bg-green-50 p-6 rounded-2xl">
            <h4 class="font-bold text-green-900 mb-2">Underflow</h4>
            <p class="text-sm text-green-800/80">
                If the Consumer is faster than the Producer, the buffer empties. The Consumer must go to sleep (block) until there is data to eat.
            </p>
         </div>
      </div>

      <h3 class="text-2xl font-bold mb-4">The Solution: Two Semaphores</h3>
      <p class="mb-6 leading-relaxed">
         Visualized in this demo, we typically use two counting semaphores:
         <br/>
         1. <code>EmptyCount</code> (Initialized to N): tracks empty slots. Producer waits on this.
         <br/>
         2. <code>FullCount</code> (Initialized to 0): tracks filled slots. Consumer waits on this.
         <br/>
         Plus a Mutex to protect the buffer array itself from concurrent access.
      </p>
    `
   },
   {
      id: "readers-writers",
      title: "Readers-Writers",
      subtitle: "Database Concurrency",
      icon: BookOpen,
      description: "A centralized problem in database design. We want to allow multiple readers to read at the same time, but if a writer is writing, no other process can access the data.",
      visualization: ReaderWriterVis,
      content: `
      <h3 class="text-2xl font-bold mb-4">Read vs Write Locks</h3>
      <p class="mb-6 leading-relaxed">
         In many applications (like a Web Server serving a static dictionary), reads are frequent (99%) and writes are rare (1%). Using a single Mutex would be inefficient because it would block Reader 2 while Reader 1 is reading, even though reading doesn't change data.
      </p>

      <h3 class="text-2xl font-bold mb-4">The Rules</h3>
      <ul class="list-disc list-inside space-y-2 mb-8 text-ink/80 text-lg">
        <li><strong>Multiple Readers:</strong> Allowed simultaneously.</li>
        <li><strong>Single Writer:</strong> Exclusive access. No other writer, no other readers.</li>
      </ul>
      
      <div class="bg-gray-50 border border-black/10 p-6 rounded-2xl mb-8">
        <h4 class="font-bold mb-2">Risk: Writer Starvation</h4>
        <p class="text-sm text-gray-600">
            In the simplest implementation (Reader Preference), acts of reading are so common that a Writer might wait forever because there is <em>always</em> at least one reader active.
            <br/>
            <strong>Fix:</strong> Writer-Preference algorithms deny new readers if a writer is waiting.
        </p>
      </div>
    `
   }
];
