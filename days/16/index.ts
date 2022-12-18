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

// Parse the input
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
  potentialFlow: number;
}

const statePotential = <T extends State>(
  s: Pick<T, "pressureReleased" | "flowRate" | "timeLeft">
) => s.pressureReleased + s.flowRate * s.timeLeft;

const createState = <T extends State>(s: Omit<T, "potentialFlow">) =>
  ({
    ...s,
    potentialFlow: statePotential(s),
  } as T);

const relevantValves = valves.filter((x) => flowRates.get(x)! > 0);

function part1() {
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
    queue.sort((lhs, rhs) => lhs.potentialFlow - rhs.potentialFlow);
    const bestState = queue.pop()!;
    if (bestState.potentialFlow > maxFlow) {
      maxFlow = bestState.potentialFlow;
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
}

function part2() {
  type State2 = Readonly<
    State & {
      current2: Valve;
      availableTime1: number;
      availableTime2: number;
    }
  >;

  const estimateMax = (state: State2): number => {
    // Open the best valves for the rest of the available time left.
    // Without caring about how to reach the valves.
    const { potentialFlow, unopened, timeLeft } = state;
    const unopenedRates = unopened.map((x) => flowRates.get(x) ?? 0);
    unopenedRates.sort((lhs, rhs) => rhs - lhs);
    return (
      potentialFlow +
      unopenedRates
        .map((r, i) => r * (timeLeft - i + 1))
        .reduce((sum, x) => sum + x, 0)
    );
  };

  const queue: State2[] = [
    createState({
      current: "AA",
      current2: "AA",
      availableTime1: 0,
      availableTime2: 0,
      unopened: relevantValves,
      flowRate: 0,
      pressureReleased: 0,
      timeLeft: 26,
    }),
  ];

  let maxFlow = 0;
  while (queue.length > 0) {
    queue.sort((lhs, rhs) => lhs.potentialFlow - rhs.potentialFlow);
    const bestState = queue.pop()!;
    const {
      availableTime1,
      availableTime2,
      current,
      current2,
      timeLeft,
      pressureReleased,
      flowRate,
      unopened,
      potentialFlow,
    } = bestState;
    if (potentialFlow > maxFlow) {
      maxFlow = potentialFlow;
    }

    // Try to ignore states that probably won't result in the max flow.
    if (estimateMax(bestState) < maxFlow) {
      continue;
    }

    if (bestState.timeLeft >= 1) {
      // Continue with the current state one more time slot:
      // This step is done to accumulate some time available
      // for the two actors.
      queue.push(
        createState({
          ...bestState,
          availableTime1: availableTime1 + 1,
          availableTime2: availableTime2 + 1,
          timeLeft: timeLeft - 1,
          pressureReleased: pressureReleased + flowRate,
        })
      );
    }

    // Search for candidates to visit next from this state.
    for (const valve of unopened) {
      if (availableTime1 === distance(current, valve) + 1) {
        queue.push(
          createState({
            ...bestState,
            current: valve,
            availableTime1: 0,
            flowRate: flowRate + (flowRates.get(valve) ?? 0),
            unopened: unopened.filter((x) => x !== valve),
          })
        );
      } else if (availableTime2 === distance(current2, valve) + 1) {
        queue.push(
          createState({
            ...bestState,
            current2: valve,
            availableTime2: 0,
            flowRate: flowRate + (flowRates.get(valve) ?? 0),
            unopened: unopened.filter((x) => x !== valve),
          })
        );
      }
    }
  }
  console.log(maxFlow);
}

part1();
// part2();
