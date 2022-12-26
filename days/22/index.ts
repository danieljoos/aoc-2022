import { Dir, readFileSync } from "fs";

// https://github.com/microsoft/TypeScript/issues/48829
declare global {
  interface Array<T> {
    findLastIndex(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): number;
  }
}

type MinMax = { min: number; max: number };
type Rotation = "L" | "R";
enum Direction {
  Right = 0,
  Down = 1,
  Left = 2,
  Up = 3,
}
type PathRotation = { rotate: Rotation };
type PathMove = { move: number };
type PathElement = PathRotation | PathMove;
interface Player {
  row: number;
  column: number;
  direction: Direction;
}

const isRotation = (x: PathElement): x is PathRotation => "rotate" in x;
const isMapTile = (x: string) => x !== " ";

const rotateLeft = (d: Direction): Direction => (d + 4 - 1) % 4;
const rotateRight = (d: Direction): Direction => (d + 4 + 1) % 4;

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });
const [partMap, partPath] = input.split("\n\n");

const groveMap = partMap.split("\n").map((x) => x.split(""));
const width = Math.max(...groveMap.map((x) => x.findLastIndex(isMapTile))) + 1;
const height = groveMap.length;

const path: PathElement[] = [];
for (let i = 0; i < partPath.length; ) {
  if (/L|R/.test(partPath[i])) {
    path.push({ rotate: partPath[i] as Rotation });
    i++;
    continue;
  }
  let end = i;
  while (/\d/.test(partPath[end])) end++;
  const sub = partPath.substring(i, end);
  path.push({ move: +sub });
  i = end;
}

function part1() {
  const minMaxRows = groveMap.map<MinMax>((row) => {
    const min = row.findIndex(isMapTile);
    const max = row.findLastIndex(isMapTile);
    return { min, max };
  });

  const minMaxCols: MinMax[] = [];
  for (let i = 0; i < width; i++) {
    const col = groveMap.map((x) => x[i] ?? " ");
    const min = col.findIndex(isMapTile);
    const max = col.findLastIndex(isMapTile);
    minMaxCols.push({ min, max });
  }

  const player: Player = {
    row: 0,
    column: minMaxRows[0].min,
    direction: Direction.Right,
  };

  for (const elem of path) {
    // Rotate:
    if (isRotation(elem)) {
      switch (elem.rotate) {
        case "L":
          player.direction = rotateLeft(player.direction);
          break;
        case "R":
          player.direction = rotateRight(player.direction);
          break;
      }
      continue;
    }

    // Move:
    for (let i = 0; i < elem.move; i++) {
      let nextCol = player.column;
      let nextRow = player.row;
      switch (player.direction) {
        case Direction.Right: {
          const { min, max } = minMaxRows[player.row];
          nextCol = nextCol >= max ? min : nextCol + 1;
          break;
        }
        case Direction.Down: {
          const { min, max } = minMaxCols[player.column];
          nextRow = nextRow >= max ? min : nextRow + 1;
          break;
        }
        case Direction.Left: {
          const { min, max } = minMaxRows[player.row];
          nextCol = nextCol <= min ? max : nextCol - 1;
          break;
        }
        case Direction.Up: {
          const { min, max } = minMaxCols[player.column];
          nextRow = nextRow <= min ? max : nextRow - 1;
          break;
        }
      }
      if (groveMap[nextRow][nextCol] === ".") {
        player.row = nextRow;
        player.column = nextCol;
      }
    }
  }

  const result = (player.row + 1) * 1000 + (player.column + 1) * 4 + player.direction;
  console.log(result);
}

function part2() {
  // Using the cube from my puzzle input:
  //   0011
  //   0011         +-----+
  //   22          /  0  /|
  //   22         +-----+ |
  // 3344         |     | +
  // 3344         |  2  |/
  // 55           +-----+
  // 55
  //

  enum CubeFace {
    Top = 0,
    Right = 1,
    Front = 2,
    Bottom = 4,
    Left = 3,
    Back = 5,
  }

  type EdgeRule = (row: number, col: number) => [CubeFace, number, number, Direction];
  type EdgeRules = { [k in Direction]: EdgeRule };
  type FaceEdgeRules = { [k in CubeFace]: EdgeRules };
  type FaceRegions = { [k in CubeFace]: { minCol: number; minRow: number } };
  type PlayerOnCube = Player & { cubeFace: CubeFace };

  const cubeWidth = 50;
  const cubeMax = cubeWidth - 1;

  const regions: FaceRegions = {
    [CubeFace.Top]: {
      minCol: cubeWidth,
      minRow: 0,
    },
    [CubeFace.Right]: {
      minCol: 2 * cubeWidth,
      minRow: 0,
    },
    [CubeFace.Front]: {
      minCol: cubeWidth,
      minRow: cubeWidth,
    },
    [CubeFace.Left]: {
      minCol: 0,
      minRow: 2 * cubeWidth,
    },
    [CubeFace.Bottom]: {
      minCol: cubeWidth,
      minRow: 2 * cubeWidth,
    },
    [CubeFace.Back]: {
      minCol: 0,
      minRow: 3 * cubeWidth,
    },
  } as const;

  const rules: FaceEdgeRules = {
    [CubeFace.Top]: {
      [Direction.Right]: (row, col) => [CubeFace.Right, row, 0, Direction.Right],
      [Direction.Down]: (row, col) => [CubeFace.Front, 0, col, Direction.Down],
      [Direction.Left]: (row, col) => [CubeFace.Left, cubeMax - row, 0, Direction.Right],
      [Direction.Up]: (row, col) => [CubeFace.Back, col, 0, Direction.Right],
    },
    [CubeFace.Right]: {
      [Direction.Right]: (row, col) => [CubeFace.Bottom, cubeMax - row, cubeMax, Direction.Left],
      [Direction.Down]: (row, col) => [CubeFace.Front, col, cubeMax, Direction.Left],
      [Direction.Left]: (row, col) => [CubeFace.Top, row, cubeMax, Direction.Left],
      [Direction.Up]: (row, col) => [CubeFace.Back, cubeMax, col, Direction.Up],
    },
    [CubeFace.Front]: {
      [Direction.Right]: (row, col) => [CubeFace.Right, cubeMax, row, Direction.Up],
      [Direction.Down]: (row, col) => [CubeFace.Bottom, 0, col, Direction.Down],
      [Direction.Left]: (row, col) => [CubeFace.Left, 0, row, Direction.Down],
      [Direction.Up]: (row, col) => [CubeFace.Top, cubeMax, col, Direction.Up],
    },
    [CubeFace.Bottom]: {
      [Direction.Right]: (row, col) => [CubeFace.Right, cubeMax - row, cubeMax, Direction.Left],
      [Direction.Down]: (row, col) => [CubeFace.Back, col, cubeMax, Direction.Left],
      [Direction.Left]: (row, col) => [CubeFace.Left, row, cubeMax, Direction.Left],
      [Direction.Up]: (row, col) => [CubeFace.Front, cubeMax, col, Direction.Up],
    },
    [CubeFace.Left]: {
      [Direction.Right]: (row, col) => [CubeFace.Bottom, row, 0, Direction.Right],
      [Direction.Down]: (row, col) => [CubeFace.Back, 0, col, Direction.Down],
      [Direction.Left]: (row, col) => [CubeFace.Top, cubeMax - row, 0, Direction.Right],
      [Direction.Up]: (row, col) => [CubeFace.Front, col, 0, Direction.Right],
    },
    [CubeFace.Back]: {
      [Direction.Right]: (row, col) => [CubeFace.Bottom, cubeMax, row, Direction.Up],
      [Direction.Down]: (row, col) => [CubeFace.Right, 0, col, Direction.Down],
      [Direction.Left]: (row, col) => [CubeFace.Top, 0, row, Direction.Down],
      [Direction.Up]: (row, col) => [CubeFace.Left, cubeMax, col, Direction.Up],
    },
  } as const;

  const player: PlayerOnCube = {
    row: 0,
    column: regions[CubeFace.Top].minCol,
    direction: Direction.Right,
    cubeFace: CubeFace.Top,
  };

  for (const elem of path) {
    // Rotate:
    if (isRotation(elem)) {
      switch (elem.rotate) {
        case "L":
          player.direction = rotateLeft(player.direction);
          break;
        case "R":
          player.direction = rotateRight(player.direction);
          break;
      }
      continue;
    }

    // Move:
    for (let i = 0; i < elem.move; i++) {
      const relRow = player.row % cubeWidth;
      const relCol = player.column % cubeWidth;

      let nextCol = relCol;
      let nextRow = relRow;
      let nextDirection = player.direction;
      let nextFace = player.cubeFace;

      switch (player.direction) {
        case Direction.Right: {
          if (relCol === cubeMax) {
            const rule = rules[player.cubeFace][Direction.Right];
            [nextFace, nextRow, nextCol, nextDirection] = rule(relRow, relCol);
          } else {
            nextCol = relCol + 1;
          }
          break;
        }
        case Direction.Down: {
          if (relRow === cubeMax) {
            const rule = rules[player.cubeFace][Direction.Down];
            [nextFace, nextRow, nextCol, nextDirection] = rule(relRow, relCol);
          } else {
            nextRow = relRow + 1;
          }
          break;
        }
        case Direction.Left: {
          if (relCol === 0) {
            const rule = rules[player.cubeFace][Direction.Left];
            [nextFace, nextRow, nextCol, nextDirection] = rule(relRow, relCol);
          } else {
            nextCol = relCol - 1;
          }
          break;
        }
        case Direction.Up: {
          if (relRow === 0) {
            const rule = rules[player.cubeFace][Direction.Up];
            [nextFace, nextRow, nextCol, nextDirection] = rule(relRow, relCol);
          } else {
            nextRow = relRow - 1;
          }
          break;
        }
      }
      const nextAbsCol = regions[nextFace].minCol + nextCol;
      const nextAbsRow = regions[nextFace].minRow + nextRow;
      const mapVal = groveMap[nextAbsRow][nextAbsCol];
      if (groveMap[nextAbsRow][nextAbsCol] === ".") {
        player.row = nextAbsRow;
        player.column = nextAbsCol;
        player.direction = nextDirection;
        player.cubeFace = nextFace;
      }
      if (mapVal !== "." && mapVal !== "#") {
        // This helped a lot while debugging!
        throw "Bad position"
      }
    }
  }

  const result = (player.row + 1) * 1000 + (player.column + 1) * 4 + player.direction;
  console.log(result);
}

part1();
// part2();
