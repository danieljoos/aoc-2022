import { readFileSync } from "fs";
const input = readFileSync(`${__dirname}/input.txt`, {
  encoding: "utf-8",
}).split("\n");

type Valve = Readonly<string>;
type Tunnel = Readonly<string>;

const valves: Valve[] = [];
const neighbors = new Map<Valve, Valve[]>();
const flowRates = new Map<Valve, number>();
const distances = new Map<Tunnel, number>();

const tunnelId = (a: Valve, b: Valve) => a + b;
const distance = (a: Valve, b: Valve) =>
  a !== b ? distances.get(tunnelId(a, b)) ?? Infinity : 0;

for (const line of input) {
  const [part1, part2] = line.split(";");
  const [_match1, valve, rate] =
    /^Valve (\w+) has flow rate=(\d+)/.exec(part1) || [];
  const [_match2, targetValves] =
    /tunnels? leads? to valves? ([\w, ]+)$/.exec(part2) || [];
  valves.push(valve);
  flowRates.set(valve, +rate);
  neighbors.set(
    valve,
    targetValves.split(",").map((x) => x.trim())
  );
  neighbors.get(valve)?.forEach((x) => distances.set(tunnelId(valve, x), 1));
}
// Calculate distance from every valve to every other valve.
for (const outerValve of valves) {
  for (const fromValve of valves) {
    for (const toValve of valves) {
      const d1 = distance(fromValve, outerValve);
      const d2 = distance(outerValve, toValve);
      const d3 = distance(fromValve, toValve);
      if (d1 + d2 < d3) {
        distances.set(tunnelId(fromValve, toValve), d1 + d2);
      }
    }
  }
}

interface State {
  current: Valve;
  unopened: Valve[];
  flowRate: number;
  pressureReleased: number;
  timeLeft: number;
  potential: number;
}

const statePotential = (
  s: Pick<State, "pressureReleased" | "flowRate" | "timeLeft">
) => s.pressureReleased + s.flowRate * s.timeLeft;

const createState = (s: Omit<State, "potential">): State => ({
  ...s,
  potential: statePotential(s),
});

const relevantValves = valves.filter((x) => flowRates.get(x)! > 0);
const queue: State[] = [
  createState({
    current: "AA",
    unopened: relevantValves,
    flowRate: 0,
    pressureReleased: 0,
    timeLeft: 30,
  }),
];

let maxFlow = 0;
while (queue.length > 0) {
  // Always sort the queue using the state potential.
  // Best states are at the end of the array.
  queue.sort((lhs, rhs) => lhs.potential - rhs.potential);
  const bestState = queue.pop()!;
  if (bestState.potential > maxFlow) {
    maxFlow = bestState.potential;
  }

  // Search for candidates to visit next from this state.
  for (const valve of bestState.unopened) {
    // The time delta is the time to move to the other valve
    // and to open it (dist+1).
    const deltaTime = distance(bestState.current, valve) + 1;
    if (deltaTime > bestState.timeLeft) {
      continue;
    }
    // If we have enough time, push that state to the priority queue.
    // The queue gets sorted later.
    queue.push(
      createState({
        current: valve,
        unopened: bestState.unopened.filter((x) => x !== valve),
        flowRate: bestState.flowRate + (flowRates.get(valve) ?? 0),
        pressureReleased:
          bestState.pressureReleased + bestState.flowRate * deltaTime,
        timeLeft: bestState.timeLeft - deltaTime,
      })
    );
  }
}

console.log(maxFlow);
