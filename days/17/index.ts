import { readFileSync } from "fs";
import { createHash } from "crypto";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type RockRow = (0 | 1)[];
type Rock = Readonly<RockRow[]>;
const rocks: Rock[] = [
  [[1, 1, 1, 1]],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  [[1], [1], [1], [1]],
  [
    [1, 1],
    [1, 1],
  ],
];
let rockPos = -1;
const getNextRock = (): Rock =>
  rocks[rockPos < rocks.length - 1 ? ++rockPos : (rockPos = 0)];

type Jet = "<" | ">";
const jets = input.split("") as Jet[];
let jetPos = -1;
const getNextJet = (): Jet =>
  jets[jetPos < jets.length - 1 ? ++jetPos : (jetPos = 0)];

const areaWidth = 7;
const area: RockRow[] = [];

const contentAt = (x: number, y: number) => area[area.length - 1 - y][x];

const enlargeArea = (count: number) => {
  for (let i = 0; i < count; i++) {
    area.push(new Array(areaWidth).fill(0));
  }
};

const shrinkArea = (): number => {
  for (let i = area.length - 1; i >= 0; i--) {
    const row = area[i];
    if (row.every((x) => !x)) {
      area.pop();
    }
    if (row.every((x) => !!x)) {
      area.splice(0, i);
      return i;
    }
  }
  return 0;
};

const drawArea = () => {
  for (let i = area.length - 1; i >= 0; i--) {
    const row = area[i].map((x) => (!!x ? "#" : "."));
    console.log(row.join(""));
  }
  console.log();
};

const canMove = (
  rock: Rock,
  xpos: number,
  ypos: number,
  dx: number,
  dy: number
): boolean => {
  const width = rock[0].length;
  const height = rock.length;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (!rock[i][j]) continue;
      const vx = xpos + j + dx;
      const vy = ypos + i + dy;
      if (vx >= areaWidth || vx < 0 || vy >= area.length) return false;
      if (contentAt(vx, vy)) return false;
    }
  }
  return true;
};

const putRock = (rock: Rock, xpos: number, ypos: number) => {
  for (let i = 0; i < rock.length; i++) {
    for (let j = 0; j < rock[i].length; j++) {
      if (!rock[i][j]) continue;
      const pieceY = area.length - 1 - (ypos + i);
      const pieceX = xpos + j;
      area[pieceY][pieceX] = rock[i][j];
    }
  }
};

const hash = () => {
  const data = Uint8Array.from([
    rockPos,
    jetPos,
    ...area.flatMap((x) => x).flatMap((x) => x),
  ]);
  return createHash("md5").update(data).digest("hex");
};

const simulate = (count: number) => {
  let result = 0;

  type SeenCacheEntry = { cachedRockCount: number; cachedResult: number };
  const seen = new Map<string, SeenCacheEntry>();

  for (let rockCount = 0; rockCount < count; rockCount++) {
    // Next rock begins falling:
    const rock = getNextRock();
    const height = rock.length;
    let xpos = 2;
    let ypos = 0;

    // Enlarge area
    enlargeArea(height + 3);

    let movingDown = true;
    while (movingDown) {
      const jet = getNextJet();
      switch (jet) {
        case "<": {
          xpos += canMove(rock, xpos, ypos, -1, 0) ? -1 : 0;
          break;
        }
        case ">": {
          xpos += canMove(rock, xpos, ypos, 1, 0) ? 1 : 0;
          break;
        }
      }
      movingDown = canMove(rock, xpos, ypos, 0, 1);
      if (movingDown) ypos++;
    }
    putRock(rock, xpos, ypos);
    result += shrinkArea();

    if (count > 2022) {
      // For part2, try to detect some state that we've already seen:
      const signature = hash();
      if (seen.has(signature)) {
        const { cachedRockCount, cachedResult } = seen.get(signature)!;
        const deltaResult = result - cachedResult;
        const deltaRockCount = rockCount - cachedRockCount;
        const factor = Math.floor((count - rockCount) / deltaRockCount);
        result += factor * deltaResult;
        rockCount += factor * deltaRockCount;
      }
      seen.set(signature, { cachedRockCount: rockCount, cachedResult: result });
    }
  }
  result += area.length;
  return result;
};

function part1() {
  console.log(simulate(2022));
}

function part2() {
  console.log(simulate(1000000000000));
}

part1();
// part2();
