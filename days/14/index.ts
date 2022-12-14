import { readFileSync } from "fs";
const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Coordinates = [number, number];
type Path = Coordinates[];
type Tile = "#" | "+" | "o";

const paths = input.split("\n").map(
  (line) =>
    line.split("->").map(
      (coords) =>
        coords
          .trim()
          .split(",")
          .map((y) => +y) as Coordinates
    ) as Path
);
const maxPathY = paths
  .flatMap((x) => x)
  .reduce((max, x) => (x[1] > max ? x[1] : max), 0);

const source: Coordinates = [500, 0];
const mapKey = ([x, y]: Coordinates) => `${x},${y}`;
const equals = ([x1, y1]: Coordinates, [x2, y2]: Coordinates) =>
  x1 === x2 && y1 === y2;
const deltaDir = (leader: number, follower: number): -1 | 1 | 0 =>
  leader > follower ? 1 : leader < follower ? -1 : 0;
const cloneMove = (coord: Coordinates, dx: number, dy: number): Coordinates => [
  coord[0] + dx,
  coord[1] + dy,
];
const move = (coord: Coordinates, dx: number, dy: number) => {
  coord[0] += dx;
  coord[1] += dy;
};
const isFloor = (coord: Coordinates, floor: number | undefined): boolean =>
  floor ? coord[1] >= floor : false;

const dropSand = (
  isOut: (sand: Coordinates) => boolean,
  floor: number | undefined = undefined
): number => {
  // Create the area and "draw" the lines
  const area = new Map<string, Tile>();
  area.set(mapKey(source), "+");
  for (const path of paths) {
    for (let i = 0; i < path.length - 1; i++) {
      const startPoint = path[i];
      const endPoint = path[i + 1];
      const curr: Coordinates = [...startPoint];
      const dx = deltaDir(endPoint[0], startPoint[0]);
      const dy = deltaDir(endPoint[1], startPoint[1]);
      while (curr[0] !== endPoint[0] || curr[1] !== endPoint[1]) {
        area.set(mapKey(curr), "#");
        curr[0] += dx;
        curr[1] += dy;
      }
      area.set(mapKey(curr), "#");
    }
  }

  let out = false;
  let round = 0;
  for (; !out; round++) {
    // Create a new sand unit
    const sand: Coordinates = [...source];
    let dirty = false;
    do {
      dirty = false;
      // drop the sand unit as far as possible
      let nextDown = cloneMove(sand, 0, 1);
      while (!area.has(mapKey(nextDown)) && !isFloor(nextDown, floor)) {
        move(sand, 0, 1);
        nextDown = cloneMove(sand, 0, 1);
        dirty = true;
      }
      // roll it to the left if possible
      const nextLeft = cloneMove(sand, -1, 1);
      const nextRight = cloneMove(sand, 1, 1);
      if (!area.has(mapKey(nextLeft)) && !isFloor(nextLeft, floor)) {
        move(sand, -1, 1);
        dirty = true;
      }
      // else try to roll it to the right
      else if (!area.has(mapKey(nextRight)) && !isFloor(nextRight, floor)) {
        move(sand, 1, 1);
        dirty = true;
      }
      out = isOut(sand);
    } while (dirty && !out);
    if (!out) {
      area.set(mapKey(sand), "o");
    }
  }
  return round - 1;
};

function part1() {
  console.log(dropSand((sand) => sand[1] >= maxPathY));
}

function part2() {
  console.log(dropSand((sand) => equals(sand, source), maxPathY + 2) + 1);
}

part1();
// part2();
