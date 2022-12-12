import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

const parseOp = (lineOp: string) => {
  const [_match, op, operand] = /new = old ([+*]) (\d+|old)/.exec(lineOp) || [];
  const isOld = operand === "old";
  switch (op) {
    case "+":
      return (x: number) => x + (isOld ? x : +operand);
    case "*":
      return (x: number) => x * (isOld ? x : +operand);
  }
};

const parseTest = (lineTest: string) => {
  const [_match, div] = /divisible by (\d+)/.exec(lineTest) || [];
  return +div;
};

const parseTrueFalse = (line: string) => {
  const [_match, target] = /throw to monkey (\d+)/.exec(line) || [];
  return +target;
};

const monkeyBusiness = (rounds: number, noRelief?: boolean) => {
  const monkeys = input.split("\n\n").map((monkeyDecl) => {
    const [_lineName, lineItems, lineOp, lineTest, lineTrue, lineFalse] =
      monkeyDecl.split("\n");
    const items = lineItems
      .split(":")[1]
      .split(",")
      .map((x) => +x);
    const op = parseOp(lineOp);
    const test = parseTest(lineTest);
    const targetTrue = parseTrueFalse(lineTrue);
    const targetFalse = parseTrueFalse(lineFalse);
    return { items, op, test, targetTrue, targetFalse, count: 0 };
  });

  const lcm = monkeys.reduce((res, curr) => res * curr.test, 1);

  for (let round = 1; round <= rounds; round++) {
    for (const monkey of monkeys) {
      const { items, op, test, targetTrue, targetFalse } = monkey;
      while (items.length > 0) {
        const item = items.shift();
        if (!item) {
          continue;
        }
        monkey.count++;
        let worryLevel = op?.(item) || 0;
        if (!noRelief) {
          worryLevel = Math.floor(worryLevel / 3);
        }
        worryLevel %= lcm;
        const targetMonkey = worryLevel % test === 0 ? targetTrue : targetFalse;
        monkeys[targetMonkey].items.push(worryLevel);
      }
    }
  }

  return [...monkeys]
    .sort((lhs, rhs) => rhs.count - lhs.count)
    .slice(0, 2)
    .reduce((sum, x) => sum * x.count, 1);
};

function part1() {
  console.log(monkeyBusiness(20));
}

function part2() {
  console.log(monkeyBusiness(10000, true));
}

part1();
// part2();
