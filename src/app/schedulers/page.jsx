// import Card from "@/components/Card";
import Card from "../../../src/Components/Card.jsx";

export default function Home() {
  const cards = [
    {
      name: "FCFS Scheduler",
      image: "/fcfs.png",
      description:
        "First-Come, First-Served (FCFS) executes processes strictly in the order they arrive. It’s simple and non-preemptive, but can suffer from the convoy effect if long jobs arrive first.",
      meta: ["Non-preemptive", "FIFO", "O(n)"],
      description2: "Good for simple, predictable workloads",
      link: "/fcfs",
    },
    {
      name: "SJF Scheduler",
      image: "/sjf.png",
      description:
        "Shortest Job First (SJF) selects the process with the smallest burst time next. It minimizes average waiting time but requires prior knowledge of execution time.",
      meta: [
        "Non-preemptive",
        "Optimal for average waiting time",
        "O(n log n)",
      ],
      description2: "Best suited when process burst times are known in advance",
      link: "/sjf",
    },

    {
      name: "SRTF Scheduler",
      image: "/srtf.png",
      description:
        "Shortest Remaining Time First (SRTF) is the preemptive version of SJF. It always selects the process with the least remaining burst time, preempting longer jobs when needed.",
      meta: ["Preemptive", "Minimizes turnaround time", "O(n log n)"],
      description2: "Ideal for time-sharing systems with known burst times",
      link: "/srtf",
    },

    {
      name: "Round Robin Scheduler",
      image: "/rr.png",
      description:
        "Round Robin (RR) assigns each process a fixed time quantum in a cyclic order. It ensures fairness and responsiveness but can increase context switching overhead.",
      meta: ["Preemptive", "Time-shared", "O(n)"],
      description2: "Best for multitasking and interactive systems",
      link: "/rr",
    },

    {
      name: "Deadlock Handling",
      image: "/deadlock.jpg",
      description:
        "Deadlock is a state where multiple processes are stuck waiting for each other’s resources. It can be managed using prevention, avoidance, detection, and recovery techniques.",
      meta: ["Resource management", "Coffman conditions", "Banker's Algorithm"],
      description2:
        "Handled using prevention, avoidance, or recovery strategies",
      link: "/deadlock",
    },
  ];
  return (
    <main className="w-full py-5 md:py-16 overflow-x-hidden ">
      {/* Page Title */}
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-xl md:text-5xl font-bold tracking-tight text-[#1f2937]">
          CPU Scheduling Algorithms
        </h1>
        <p className="mt-2 text-sm md:text-base text-[#4b5563]">
          Explore and simulate popular CPU scheduling strategies.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 mt-4 md:mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {cards.map((card, idx) => (
            <Card key={`${card.name}-${idx}`} card={card} />
          ))}
        </div>
      </div>
    </main>
  );
}
