import { readFileSync } from "fs";

type Instruction = "addx" | "noop";
type TickHandler = (regX: number, cycle: number) => void;

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });
const program = input.split("\n").map((line) => {
  const [_match, instruction, arg] =
    /^(\w+)(?:\s+([\-\d]+))?$/.exec(line) || [];
  return { instruction: instruction as Instruction, arg: +arg };
});

const runProgram = (maxCycle: number, onTick: TickHandler) => {
  let regX = 1;
  let eip = 0;
  let cycle = 1;

  const tick = (onTick: TickHandler) => {
    onTick(regX, cycle);
    cycle++;
  };

  while (cycle <= maxCycle) {
    if (eip >= program.length) {
      tick(onTick);
      continue;
    }
    const { instruction, arg } = program[eip++];
    switch (instruction) {
      case "addx": {
        tick(onTick);
        tick(onTick);
        regX += arg;
        break;
      }
      case "noop":
        tick(onTick);
        break;
    }
  }
};

function part1() {
  const profileX: number[] = [];
  runProgram(220, (regX) => profileX.push(regX));
  const signalStrengths = [20, 60, 100, 140, 180, 220].map(
    (c) => profileX[c - 1] * c
  );
  console.log(signalStrengths.reduce((sum, x) => sum + x, 0));
}

function part2() {
  let line = 0;
  const screen: string[] = Array(6).fill("");
  runProgram(240, (regX, cycle) => {
    const diff = cycle - line * 40 - regX;
    const pixel = diff >= 0 && diff < 3 ? "#" : ".";
    screen[line] += pixel;
    if (cycle % 40 === 0) {
      line++;
    }
  });
  console.log(screen.join("\n"));
}

part1();
// part2();
