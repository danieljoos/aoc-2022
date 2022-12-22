import { readFileSync } from "fs";

const resourceKeys = ["geode", "obsidian", "clay", "ore"] as const;
type Resource = typeof resourceKeys[number];
type ResourceCounts = { [c in Resource]: number };

interface Blueprint {
  id: number;
  robots: { [r in Resource]: ResourceCounts };
}

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

// Parse the input
const blueprints = input.split("\n").map((line) => {
  const [name, costs] = line.split(":");
  const [_match, id] = /Blueprint (\d+)/.exec(name) ?? [];
  const robots = costs
    .split(".")
    .map((costStmt) => {
      const [_match, type, costOre, costClay, costObsidian] =
        /Each (\w+) robot costs (\d+) ore(?: and (\d+) clay)?(?: and (\d+) obsidian)?/.exec(
          costStmt
        ) ?? [];
      return {
        type: type as Resource,
        costs: {
          ore: +(costOre ?? 0),
          clay: +(costClay ?? 0),
          obsidian: +(costObsidian ?? 0),
          geode: 0,
        },
      };
    })
    .filter((x) => !!x.type)
    .reduce((r, { type, costs }) => {
      r[type] = costs;
      return r;
    }, {} as Blueprint["robots"]);
  return { id: +id, robots } as Blueprint;
});

const simulate = (blueprint: Blueprint, maxTime: number): number => {
  type State = Readonly<{
    minute: number;
    resources: ResourceCounts;
    robots: ResourceCounts;
  }>;

  // Initial state: we have 1 ore robot.
  const states: State[] = [
    {
      minute: 1,
      resources: {
        geode: 0,
        obsidian: 0,
        clay: 0,
        ore: 0,
      },
      robots: {
        geode: 0,
        obsidian: 0,
        clay: 0,
        ore: 1,
      },
    },
  ];

  const mine = (robots: ResourceCounts, into: ResourceCounts) => {
    for (const robotType of resourceKeys) {
      into[robotType] += robots[robotType];
    }
    return into;
  };

  const canBuild = (
    resources: ResourceCounts,
    costs: ResourceCounts
  ): boolean =>
    resourceKeys.reduce(
      (result, r) => result && resources[r] >= costs[r],
      true
    );

  const build = (resources: ResourceCounts, costs: ResourceCounts) => {
    resourceKeys.forEach((r) => (resources[r] -= costs[r]));
    return resources;
  };

  const gauss = (n: number): number => (n * (n + 1)) / 2;

  const toString = (state: State) =>
    resourceKeys.map((x) => state.resources[x]).join(",") +
    "/" +
    resourceKeys.map((x) => state.robots[x]).join(",") +
    `${state.minute}`;

  // For this blueprint, calculate the max. required robots for each resource type
  const maxRequiredRobots = resourceKeys.reduce((result, r) => {
    result[r] = Math.max(...resourceKeys.map((r2) => blueprint.robots[r2][r]));
    return result;
  }, {} as ResourceCounts);

  let bestState: State = states[0];
  const seen = new Set<string>();
  while (states.length > 0) {
    const state = states.pop()!;

    // Skip states that we've already seen before.
    const stateString = toString(state);
    if (seen.has(stateString)) {
      continue;
    }
    seen.add(stateString);

    if (state.resources.geode > bestState.resources.geode) {
      bestState = state;
    }

    if (state.minute > maxTime) {
      continue;
    }

    // Calculate an upper bound:
    // What if the state would only build geode-robots for
    // the remaining time?
    const timeLeft = maxTime + 1 - state.minute;
    const upperBoundGeodes =
      state.resources.geode +
      state.robots.geode * timeLeft +
      gauss(timeLeft - 1);
    if (upperBoundGeodes <= bestState.resources.geode) {
      continue;
    }

    // Just let them mine:
    states.push({
      minute: state.minute + 1,
      robots: { ...state.robots },
      resources: mine(state.robots, { ...state.resources }),
    });

    // Build robots:
    for (const robotType of resourceKeys) {
      if (
        robotType !== "geode" &&
        state.robots[robotType] >= maxRequiredRobots[robotType]
      ) {
        continue;
      }
      if (canBuild(state.resources, blueprint.robots[robotType])) {
        const robots = { ...state.robots };
        robots[robotType]++;
        const resources = build(
          { ...state.resources },
          blueprint.robots[robotType]
        );
        states.push({
          minute: state.minute + 1,
          robots,
          resources: mine(state.robots, resources), // <-- Mine using the old robots, still.
        });
      }
    }
  }

  // Show some progress, as this takes a while
  console.log(blueprint.id, "done");
  return bestState.resources.geode;
};

function part1() {
  const results = blueprints.map((x) => simulate(x, 24) * x.id);
  console.log(results.reduce((sum, x) => sum + x, 0));
}

function part2() {
  const results = blueprints.slice(0, 3).map((x) => simulate(x, 32));
  console.log(results.reduce((mul, x) => mul * x, 1));
}

part1();
// part2();
