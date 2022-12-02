import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, {
  encoding: "utf-8",
}).split("\n");

const norm = "A".charCodeAt(0);
const delta = "X".charCodeAt(0) - norm;

const rounds = input.map((round) =>
  round.split(" ").map((p, i) => p.charCodeAt(0) - norm - i * delta)
);

function part1() {
  const matrix = [
    /*
    [R, P, S]
    */
    [1, 0, 2], // Rock
    [2, 1, 0], // Paper
    [0, 2, 1], // Scissors
  ] as const;
  const points = rounds
    .map(([p1, p2]) => matrix[p2][p1] * 3 + p2 + 1)
    .reduce((p, c) => p + c, 0);
  console.log(points);
}

function part2() {
  const matrix = [
    /*
    [R, P, S]
    */
    [2, 0, 1], // Lose
    [0, 1, 2], // Draw
    [1, 2, 0], // Win
  ] as const;
  const points = rounds
    .map(([p1, p2]) => matrix[p2][p1] + 1 + p2 * 3)
    .reduce((p, c) => p + c, 0);
  console.log(points);
}

part1();
// part2();
