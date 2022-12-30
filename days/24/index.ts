import { readFileSync } from "fs";

const directions = ["^", "v", "<", ">"] as const;
type Direction = typeof directions[number];
type Position = { x: number; y: number };
type Blizzard = Position & { direction: Direction };
type Blizzards = Readonly<Blizzard>[];
type BlizzardSet = Set<ReturnType<typeof mapKey>>;
type Valley = { width: number; height: number };
type InitialData = Valley & { blizzards: Blizzards };
type State = Position & { minute: number };

const mapKey = ({ x, y }: Position) => `${x}/${y}`;
const stateKey = (state: State): string => mapKey(state) + `,${state.minute}`;

const createBlizzardSet = (blizzards: Blizzards): BlizzardSet =>
  blizzards.reduce((s, blizz) => s.add(mapKey(blizz)), new Set<ReturnType<typeof mapKey>>());

const nextBlizzards = (blizzards: Blizzards, { width, height }: Valley): Blizzards =>
  blizzards.map((blizzard) => {
    const nextPos = getNextPos(blizzard, blizzard.direction);
    if (nextPos.x < 1) nextPos.x = width - 2;
    else if (nextPos.x > width - 2) nextPos.x = 1;
    else if (nextPos.y < 1) nextPos.y = height - 2;
    else if (nextPos.y > height - 2) nextPos.y = 1;
    return { ...nextPos, direction: blizzard.direction };
  });

const precalcBlizzards = (initialData: InitialData) => {
  const cache: Blizzards[] = [initialData.blizzards];
  const getBlizzards = (minute: number) => {
    if (cache.length - 1 < minute) {
      const before = getBlizzards(minute - 1);
      cache[minute] = nextBlizzards(before, initialData);
    }
    return cache[minute];
  };

  const setCache: BlizzardSet[] = [createBlizzardSet(initialData.blizzards)];
  const getBlizzardSet = (minute: number) => {
    if (setCache.length - 1 < minute) {
      getBlizzardSet(minute - 1);
      setCache[minute] = createBlizzardSet(getBlizzards(minute));
    }
    return setCache[minute];
  };

  getBlizzards(1000);
  getBlizzardSet(1000);

  return { getBlizzards, getBlizzardSet };
};

const getNextPos = ({ x, y }: Position, direction: Direction): Position => {
  switch (direction) {
    case "<":
      return { x: x - 1, y };
    case ">":
      return { x: x + 1, y };
    case "^":
      return { x, y: y - 1 };
    case "v":
      return { x, y: y + 1 };
  }
};

const canMoveTo = (position: Position, { width, height }: Valley): boolean =>
  position.x > 0 && position.x < width - 1 && position.y > 0 && position.y < height - 1;

const equalsPosition = (lhs: Position, rhs: Position): boolean => lhs.x === rhs.x && lhs.y === rhs.y;

const distancePositions = (lhs: Position, rhs: Position) => Math.abs(lhs.x - rhs.x) + Math.abs(lhs.y - rhs.y);

const animate = (startPos: Position, targetPos: Position, initialData: InitialData, minute = 0) => {
  const { getBlizzardSet } = precalcBlizzards(initialData);
  const valley: Valley = initialData;

  const sortByMinute = (lhs: State, rhs: State) => lhs.minute - rhs.minute;
  const sortByDistance = (lhs: State, rhs: State) =>
    distancePositions(lhs, targetPos) - distancePositions(rhs, targetPos);

  const states: Readonly<State>[] = [{ ...startPos, minute }];
  const seenStates = new Set<ReturnType<typeof stateKey>>();
  let bestState: Readonly<State> | undefined = undefined; // best state from start to target

  while (states.length > 0) {
    states.sort((lhs, rhs) => sortByMinute(lhs, rhs) || sortByDistance(rhs, lhs));
    const state = states.pop()!;
    const bestMinute = bestState?.minute ?? Infinity;

    if (equalsPosition(state, targetPos)) {
      if (state.minute < bestMinute) {
        bestState = state;
      }
      continue;
    }

    // Already worse than current best?
    if (state.minute >= bestMinute) {
      continue;
    }

    // Can it get better than best with ideal movement?
    if (state.minute + distancePositions(state, targetPos) >= bestMinute) {
      continue;
    }

    // Seen this before?
    const signature = stateKey(state);
    if (seenStates.has(signature)) {
      continue;
    }
    seenStates.add(signature);

    // Check for blizzards on this position
    if (getBlizzardSet(state.minute).has(mapKey(state))) {
      continue;
    }

    // Try to move
    for (const direction of directions) {
      const nextPos = getNextPos(state, direction);
      if (equalsPosition(nextPos, targetPos) || canMoveTo(nextPos, valley)) {
        states.push({ ...nextPos, minute: state.minute + 1 });
      }
    }

    // Try to wait
    states.push({ ...state, minute: state.minute + 1 });
  }

  return bestState!;
};

const parseData = (): InitialData => {
  const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });
  const data = input.split("\n").map((line) => line.split(""));
  const width = data[0].length;
  const height = data.length;
  const blizzards = data.flatMap((row, i) =>
    row
      .map((x, j) => {
        const direction = directions.find((y) => y === x);
        if (!direction) return undefined;
        return { direction, x: j, y: i };
      })
      .filter((x) => !!x)
  ) as Blizzards;
  return { width, height, blizzards };
};

function part1() {
  const data = parseData();
  const w = animate({ x: 1, y: 0 }, { x: data.width - 2, y: data.height - 1 }, data);
  console.log(w.minute);
}

function part2() {
  const data = parseData();
  const startPos: Position = { x: 1, y: 0 };
  const endPos: Position = { x: data.width - 2, y: data.height - 1 };

  const w1 = animate(startPos, endPos, data);
  const w2 = animate(endPos, startPos, data, w1.minute);
  const w3 = animate(startPos, endPos, data, w2.minute);

  console.log(w3.minute);
}

part1();
part2();
