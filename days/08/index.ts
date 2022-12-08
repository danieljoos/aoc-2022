import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });
const trees = input.split("\n").map((x) => x.split("").map((x) => +x));

const isVisible = (x: number, y: number): boolean => {
  const tree = trees[y][x];
  const visibleFromLeft = () => {
    for (let i = 0; i < x; i++) {
      if (trees[y][i] >= tree) {
        return false;
      }
    }
    return true;
  };
  const visibleFromRight = () => {
    for (let i = trees[0].length - 1; i > x; i--) {
      if (trees[y][i] >= tree) {
        return false;
      }
    }
    return true;
  };
  const visibleFromTop = () => {
    for (let i = 0; i < y; i++) {
      if (trees[i][x] >= tree) {
        return false;
      }
    }
    return true;
  };
  const visibleFromBottom = () => {
    for (let i = trees.length - 1; i > y; i--) {
      if (trees[i][x] >= tree) {
        return false;
      }
    }
    return true;
  };
  return (
    visibleFromLeft() ||
    visibleFromTop() ||
    visibleFromRight() ||
    visibleFromBottom()
  );
};

const scenicScore = (x: number, y: number): number => {
  const tree = trees[y][x];
  const fromLeft = () => {
    for (let i = x - 1; i >= 0; i--) {
      if (trees[y][i] >= tree) {
        return x - i;
      }
    }
    return x;
  };
  const fromRight = () => {
    for (let i = x + 1; i < trees[y].length; i++) {
      if (trees[y][i] >= tree) {
        return i - x;
      }
    }
    return trees[y].length - 1 - x;
  };
  const fromTop = () => {
    for (let i = y - 1; i >= 0; i--) {
      if (trees[i][x] >= tree) {
        return y - i;
      }
    }
    return y;
  };
  const fromBottom = () => {
    for (let i = y + 1; i < trees.length; i++) {
      if (trees[i][x] >= tree) {
        return i - y;
      }
    }
    return trees.length - 1 - y;
  };
  return fromLeft() * fromRight() * fromTop() * fromBottom();
};

function part1() {
  let visibleCount = trees.length * 2 + trees[0].length * 2 - 4;
  for (let i = 1; i < trees.length - 1; i++) {
    for (let j = 1; j < trees[i].length - 1; j++) {
      if (isVisible(j, i)) visibleCount++;
    }
  }
  console.log(visibleCount);
}

function part2() {
  let highestScore = 0;
  for (let i = 1; i < trees.length - 1; i++) {
    for (let j = 1; j < trees[i].length - 1; j++) {
      const score = scenicScore(j, i);
      if (score > highestScore) highestScore = score;
    }
  }
  console.log(highestScore);
}

part1();
part2();
