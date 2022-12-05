import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Crate = string;
type Stack = Crate[];
type Move = { from: number; to: number; count: number };

const parseStacks = (partStacks: string): Stack[] => {
  const inputCrates = partStacks.split("\n");
  const stacks =
    inputCrates
      .pop()
      ?.split(" ")
      .filter((x) => x !== "")
      .map<Stack>(() => []) ?? [];
  for (const line of inputCrates) {
    for (let i = 0, j = 0; i < line.length; i += 4, j++) {
      const crate = line[i + 1];
      if (crate !== " ") {
        stacks[j].push(crate);
      }
    }
  }
  return stacks;
};

const parseMoves = (partMoves: string): Move[] =>
  partMoves.split("\n").map<Move>((line) => {
    const [_match, count, from, to] =
      /^move (\d+) from (\d+) to (\d+)$/.exec(line) || [];
    return { from: +from, to: +to, count: +count };
  });

const [partStacks, partMoves] = input.split("\n\n");
const stacks = parseStacks(partStacks);
const moves = parseMoves(partMoves);

function part1() {
  for (const move of moves) {
    stacks[move.to - 1] = [
      ...stacks[move.from - 1].splice(0, move.count).reverse(),
      ...stacks[move.to - 1],
    ];
  }
  console.log(stacks.map((stack) => stack[0]).join(""));
}

function part2() {
  for (const move of moves) {
    stacks[move.to - 1] = [
      ...stacks[move.from - 1].splice(0, move.count),
      ...stacks[move.to - 1],
    ];
  }
  console.log(stacks.map((stack) => stack[0]).join(""));
}

part1();
// part2();
