import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, {
  encoding: "utf-8",
}).split("\n");

type Rucksack = number[];
type Group = [Rucksack, Rucksack, Rucksack];

const offsetSmall = "a".charCodeAt(0);
const offsetLarge = "A".charCodeAt(0);

const priority = (item: string) => {
  const num = item.charCodeAt(0);
  return num >= offsetLarge && num <= offsetLarge + 26
    ? num - offsetLarge + 26 + 1
    : num - offsetSmall + 1;
};

const rucksacks = input.map<Rucksack>((line) => line.split("").map(priority));

function part1() {
  console.log(
    rucksacks.reduce((sum, r) => {
      const first = r.slice(0, r.length / 2);
      const second = r.slice(r.length / 2);
      return sum + (first.find((x) => second.includes(x)) ?? 0);
    }, 0)
  );
}

function part2() {
  let sum = 0;
  for (let i = 0; i < rucksacks.length; i += 3) {
    const [r1, r2, r3] = rucksacks.slice(i, i + 3) as Group;
    sum += r1.find((x) => r2.includes(x) && r3.includes(x)) ?? 0;
  }
  console.log(sum);
}

part1();
// part2();
