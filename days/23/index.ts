import { readFileSync } from "fs";

interface Position {
  x: number;
  y: number;
}

type Direction = "N" | "S" | "W" | "E";
type Directions = Direction[];
type Elf = Position;
type ElvesMap = Map<string, Position>;

const mapKey = ({ x, y }: Position) => `${x}/${y}`;

const hasNeighbors = ({ x, y }: Elf, elves: ElvesMap): boolean =>
  [
    { x: x - 1, y: y - 1 }, // NW
    { x, y: y - 1 }, // N
    { x: x + 1, y: y - 1 }, // NE
    { x: x - 1, y: y + 1 }, // SW
    { x, y: y + 1 }, // S
    { x: x + 1, y: y + 1 }, // SE
    { x: x - 1, y }, // W
    { x: x + 1, y }, // E
  ].some((x) => elves.has(mapKey(x)));

const proposeDirection = (elf: Elf, elves: ElvesMap, directions: Directions): Direction | undefined => {
  const { x, y } = elf;
  for (const dir of directions) {
    const checkPos: Position[] = [];
    switch (dir) {
      case "N":
        checkPos.push({ x: x - 1, y: y - 1 }, { x, y: y - 1 }, { x: x + 1, y: y - 1 });
        break;
      case "S":
        checkPos.push({ x: x - 1, y: y + 1 }, { x, y: y + 1 }, { x: x + 1, y: y + 1 });
        break;
      case "W":
        checkPos.push({ x: x - 1, y: y - 1 }, { x: x - 1, y }, { x: x - 1, y: y + 1 });
        break;
      case "E":
        checkPos.push({ x: x + 1, y: y - 1 }, { x: x + 1, y }, { x: x + 1, y: y + 1 });
        break;
    }
    if (!checkPos.some((x) => elves.has(mapKey(x)))) {
      return dir;
    }
  }
};

const nextTile = ({ x, y }: Elf, direction: Direction): Position => {
  switch (direction) {
    case "N":
      return { x, y: y - 1 };
    case "S":
      return { x, y: y + 1 };
    case "W":
      return { x: x - 1, y };
    case "E":
      return { x: x + 1, y };
  }
};

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });
const data = input.split("\n").map((line) => line.split(""));

const simulate = (maxRound: number = Infinity) => {
  const elves = data
    .map((row, i) => row.map((elem, j) => (elem === "#" ? { x: j, y: i } : undefined)))
    .flatMap((x) => x)
    .filter((x) => !!x) as Elf[];
  const elvesMap = new Map<string, Elf>();
  elves.forEach((x) => elvesMap.set(mapKey(x), x));
  const directions: Directions = ["N", "S", "W", "E"];

  let isMoving = true;
  let round = 0;
  for (; round < maxRound && isMoving; round++) {
    const elvesNext: { elf: Elf; next: Position }[] = [];
    for (const elf of elves) {
      if (!hasNeighbors(elf, elvesMap)) continue;
      const direction = proposeDirection(elf, elvesMap, directions);
      if (!direction) continue;
      const next = nextTile(elf, direction);
      elvesNext.push({ elf, next });
    }
    const posCount = elvesNext.reduce(
      (m, x) => m.set(mapKey(x.next), (m.get(mapKey(x.next)) ?? 0) + 1),
      new Map<string, number>()
    );
    isMoving = false;
    for (const { elf, next } of elvesNext) {
      const count = posCount.get(mapKey(next)) ?? 0;
      if (count !== 1) continue;
      // Move:
      isMoving = true;
      elvesMap.delete(mapKey(elf));
      elf.x = next.x;
      elf.y = next.y;
      elvesMap.set(mapKey(elf), elf);
    }

    directions.push(directions.shift()!);
  }

  return { elves, elvesMap, round };
};

function part1() {
  const { elves, elvesMap } = simulate(10);
  const minX = Math.min(...elves.map(({ x }) => x));
  const maxX = Math.max(...elves.map(({ x }) => x));
  const minY = Math.min(...elves.map(({ y }) => y));
  const maxY = Math.max(...elves.map(({ y }) => y));
  let count = 0;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (!elvesMap.has(mapKey({ x, y }))) count++;
    }
  }

  console.log(count);
}

function part2() {
  const { round } = simulate();
  console.log(round);
}

part1();
part2();
