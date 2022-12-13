import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Value = number | Value[];
type Pair = [Value, Value];

const pairs = input
  .split("\n\n")
  .map((block) => block.split("\n").map((x) => eval(x)) as Pair);

const recursiveCompare = (lhs: Value, rhs: Value): -1 | 0 | 1 => {
  if (typeof lhs === "number") {
    if (typeof rhs === "number") {
      if (lhs < rhs) {
        return -1;
      } else if (lhs > rhs) {
        return 1;
      } else {
        return 0;
      }
    }
    return recursiveCompare([lhs], rhs);
  }

  if (typeof rhs === "number") {
    return recursiveCompare(lhs, [rhs]);
  }

  for (let i = 0; i < lhs.length; i++) {
    if (i >= rhs.length) {
      return 1;
    }
    const r = recursiveCompare(lhs[i], rhs[i]);
    if (r !== 0) {
      return r;
    }
  }

  if (rhs.length > lhs.length) {
    return -1;
  }

  return 0;
};

function part1() {
  console.log(
    pairs
      .map(([lhs, rhs], i) => (recursiveCompare(lhs, rhs) === -1 ? i + 1 : 0))
      .reduce((sum: number, x) => sum + x, 0)
  );
}

function part2() {
  const allPackages = pairs.flatMap((x) => x);
  const divider1 = [[2]];
  const divider2 = [[6]];
  allPackages.push(divider1, divider2);
  allPackages.sort(recursiveCompare);
  const idxDivider1 = allPackages.findIndex((x) => x === divider1);
  const idxDivider2 = allPackages.findIndex((x) => x === divider2);
  console.log((idxDivider1 + 1) * (idxDivider2 + 1));
}

part1();
// part2();
