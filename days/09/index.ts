import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Direction = "L" | "R" | "D" | "U";
type Step = -1 | 0 | 1;
type Position = Readonly<{
  x: number;
  y: number;
}>;
type Rope = Position[];

const motions = input.split("\n").map((motion) => {
  const [dir, count] = motion.split(" ");
  return { dir: dir as Direction, count: +count };
});

const createRope = (count: number) =>
  new Array(count).fill(null).map(() => ({ x: 0, y: 0 }));

const isTouching = (p1: Position, p2: Position): boolean =>
  Math.abs(p1.x - p2.x) <= 1 && Math.abs(p1.y - p2.y) <= 1;

const directionStep = (dir: Direction): [Step, Step] => {
  switch (dir) {
    case "L":
      return [-1, 0];
    case "R":
      return [1, 0];
    case "U":
      return [0, -1];
    case "D":
      return [0, 1];
  }
};

const followStep = (leader: number, follower: number): Step =>
  leader > follower ? 1 : leader < follower ? -1 : 0;

const move = (rope: Rope, dx: Step, dy: Step) => {
  rope[0] = { x: rope[0].x + dx, y: rope[0].y + dy };
  for (let i = 1; i < rope.length; i++) {
    const knot = rope[i];
    const prevKnot = rope[i - 1];
    if (!isTouching(knot, prevKnot)) {
      rope[i] = {
        x: knot.x + followStep(prevKnot.x, knot.x),
        y: knot.y + followStep(prevKnot.y, knot.y),
      };
    }
  }
};

const countTailPos = (rope: Rope): number => {
  const allTailPos: Position[] = [];
  for (const motion of motions) {
    const [dx, dy] = directionStep(motion.dir);
    for (let i = 0; i < motion.count; i++) {
      move(rope, dx, dy);
      allTailPos.push(rope[rope.length - 1]);
    }
  }
  return allTailPos.filter(
    (x, i, arr) => arr.findIndex((y) => y.x === x.x && y.y === x.y) === i
  ).length;
};

function part1() {
  console.log(countTailPos(createRope(2)));
}

function part2() {
  console.log(countTailPos(createRope(10)));
}

part1();
// part2();
