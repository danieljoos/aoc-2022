import { readFileSync } from "fs";

const parseSNAFU = (snafu: string): number => {
  let result = 0;
  for (let i = snafu.length - 1, pos = 1; i >= 0; i--, pos *= 5) {
    switch (snafu[i]) {
      case "-":
        result -= pos;
        break;
      case "=":
        result -= 2 * pos;
        break;
      default:
        result += +snafu[i] * pos;
    }
  }
  return result;
};

const printSNAFU = (value: number): string => {
  const glyphs = ["=", "-", "0", "1", "2"] as const;
  let rem = value;
  let res: string[] = [];
  do {
    const pos = (rem + 2) % 5;
    res.push(glyphs[pos]);
    rem = Math.floor((rem + 2) / 5);
  } while (rem > 0);
  return res.reverse().join("");
};

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

const result = input
  .split("\n")
  .map(parseSNAFU)
  .reduce((sum, x) => sum + x, 0);
console.log(printSNAFU(result));
