import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });
const elves = input
  .split("\n\n")
  .map((elf) => elf.split("\n").map((line) => +line));
const calories = elves
  .map((elf) => elf.reduce((calories, c) => calories + c, 0))
  .sort((a, b) => b - a);

function part1() {
  console.log(calories[0]);
}

function part2() {
  console.log(calories[0] + calories[1] + calories[2]);
}

part1();
// part2();
