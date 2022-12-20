import { readFileSync } from "fs";
const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Cube = [number, number, number];
const cubes = input.split("\n").map((x) => x.split(",").map((y) => +y) as Cube);

const cubeSetKey = (cube: Cube) => cube.join(",");
const cubeSet = new Set(cubes.map(cubeSetKey));

const neighborDeltas = [
  [0, 0, 1],
  [0, 1, 0],
  [1, 0, 0],
  [0, 0, -1],
  [0, -1, 0],
  [-1, 0, 0],
];
const neighborCubes = ([x, y, z]: Cube) =>
  neighborDeltas.map(([dx, dy, dz]) => [x + dx, y + dy, z + dz] as Cube);

function part1() {
  const adjacentCubes = cubes
    .flatMap(neighborCubes)
    .filter((c) => cubeSet.has(cubeSetKey(c)));
  console.log(cubes.length * 6 - adjacentCubes.length);
}

function part2() {
  const mins = [0, 0, 0].map(
    (_x, i) => Math.min(...cubes.map((c) => c[i])) - 1
  );
  const maxs = [0, 0, 0].map(
    (_x, i) => Math.max(...cubes.map((c) => c[i])) + 1
  );

  // Flood fill:
  const fillQueue: Cube[] = [mins as Cube];
  const waterSet = new Set<string>();
  while (fillQueue.length > 0) {
    const c = fillQueue.pop()!;
    const k = cubeSetKey(c);
    if (waterSet.has(k) || cubeSet.has(k)) continue;
    waterSet.add(k);
    const neighbors = neighborCubes(c).filter((x) =>
      x.reduce((r, e, i) => r && e >= mins[i] && e <= maxs[i], true)
    );
    fillQueue.push(...neighbors);
  }

  // Count sides that touch water:
  const exteriorCubes = cubes
    .flatMap(neighborCubes)
    .filter((c) => waterSet.has(cubeSetKey(c)));
  console.log(exteriorCubes.length);
}

part1();
part2();
