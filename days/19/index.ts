import { readFileSync } from "fs";
import { inspect } from "util";
const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Resource = "ore" | "clay" | "obsidian" | "geode";
type ResourceCounts = { [c in Resource]?: number };

interface Blueprint {
  name: string;
  robots: { [r in Resource]: ResourceCounts };
}

const robotPrios: Resource[] = ["geode", "obsidian", "clay", "ore"];

const blueprints = input.split("\n").map((line) => {
  const [name, costs] = line.split(":");
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
        },
      };
    })
    .filter((x) => !!x.type)
    .reduce((r, { type, costs }) => {
      r[type] = costs;
      return r;
    }, {} as Blueprint["robots"]);
  return { name, robots } as Blueprint;
});

const simulate = (minutes: number, blueprint: Blueprint) => {
  interface State {
    timeLeft: number;
    resources: ResourceCounts;
    robots: ResourceCounts;
  }

  const states: State[] = [
    {
      timeLeft: minutes,
      resources: {},
      robots: { ore: 1 },
    },
  ];

  while (states.length > 0) {
    states.sort((lhs, rhs) => (lhs.robots.ore ?? 0) - (rhs.robots.ore ?? 0));
    const state = states.pop()!;

    let resources = { ...state.resources };

    // First let all robots collect
    for (const robotType in state.robots) {
      const robotCount = state.robots[robotType as Resource] ?? 0;
      resources[robotType as Resource] =
        (resources[robotType as Resource] ?? 0) + robotCount;
    }

    // Try to build new robots:
    for (const robotType of r)

    const timeLeft = state.timeLeft - 1;
    if (timeLeft) {
      states.push({
        ...state,
        timeLeft,
        resources,
      });
      console.log(states);
    }
  }
};

function part1() {
  const result = simulate(24, blueprints[0]);
  console.log(result);
}

part1();
