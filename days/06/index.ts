import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

function hasSliceDuplicates(begin: number, end: number): boolean {
  for (let i = begin; i < end; i++) {
    for (let j = i + 1; j < end; j++) {
      if (input[i] === input[j]) {
        return true;
      }
    }
  }
  return false;
}

function findFirstUnique(count: number) {
  for (let i = count; i < input.length; i++) {
    if (!hasSliceDuplicates(i - count, i)) {
      return i;
    }
  }
}

function part1() {
  console.log(findFirstUnique(4));
}

function part2() {
  console.log(findFirstUnique(14));
}

part1();
// part2();
