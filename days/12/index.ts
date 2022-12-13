import { readFileSync } from "fs";
const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Vertex = Readonly<{ x: number; y: number; val: string; numVal: number }>;

const getNumVal = (x: string) => {
  if (x === "S") return "a".charCodeAt(0);
  if (x === "E") return "z".charCodeAt(0);
  return x.charCodeAt(0);
};

const heightmap = input.split("\n").map((line, i) =>
  line.split("").map<Vertex>((x, j) => ({
    x: j,
    y: i,
    val: x,
    numVal: getNumVal(x),
  }))
);
const allNodes = heightmap.flatMap((x) => x);

const findShortestDistance = (
  startNode: Vertex,
  isEnd: (currNode: Vertex) => boolean,
  isValidNeighbor: (node: Vertex, currNode: Vertex) => boolean
): number => {
  const distanceMap = new Map<Vertex, number>();
  const unvisitedSet = new Set(allNodes);
  allNodes.forEach((x) => distanceMap.set(x, Number.POSITIVE_INFINITY));
  distanceMap.set(startNode, 0);

  let currNode = startNode;
  while (unvisitedSet.size > 0) {
    // Find min distance node
    let distance = Number.POSITIVE_INFINITY;
    for (const node of unvisitedSet) {
      const d = distanceMap.get(node) || Number.POSITIVE_INFINITY;
      if (d < distance) {
        currNode = node;
        distance = d;
      }
    }

    if (isEnd(currNode)) {
      break;
    }

    // Remove current node from unvisited set
    unvisitedSet.delete(currNode);
    if (unvisitedSet.size === 0) {
      return Number.POSITIVE_INFINITY;
    }

    // Find unvisited neighbors
    const neighbors = [
      currNode.x > 0 //left
        ? heightmap[currNode.y][currNode.x - 1]
        : undefined,
      currNode.x < heightmap[0].length - 1 // right
        ? heightmap[currNode.y][currNode.x + 1]
        : undefined,
      currNode.y > 0 // top
        ? heightmap[currNode.y - 1][currNode.x]
        : undefined,
      currNode.y < heightmap.length - 1 // bottom
        ? heightmap[currNode.y + 1][currNode.x]
        : undefined,
    ].filter(
      (x) => !!x && unvisitedSet.has(x) && isValidNeighbor(x, currNode)
    ) as Vertex[];

    // update distances
    neighbors.forEach((x) => {
      const distance = (distanceMap.get(currNode) || 0) + 1;
      if ((distanceMap.get(x) || Number.POSITIVE_INFINITY) > distance) {
        distanceMap.set(x, distance);
      }
    });
  }

  return distanceMap.get(currNode) || Number.POSITIVE_INFINITY;
};

const part1 = () => {
  const startNode = allNodes.find((x) => x.val === "S");
  const endNode = allNodes.find((x) => x.val === "E");
  if (!startNode || !endNode) {
    throw "invalid input";
  }
  // Run Dijkstra algorithm from S to E,
  console.log(
    findShortestDistance(
      startNode,
      (x) => x === endNode,
      (x, currNode) => x.numVal - currNode.numVal <= 1
    )
  );
};

const part2 = () => {
  const endNode = allNodes.find((x) => x.val === "E");
  if (!endNode) {
    throw "invalid input";
  }
  // Run Dijkstra algorithm from E to a node with value "a".
  const targetVal = "a".charCodeAt(0);
  console.log(
    findShortestDistance(
      endNode,
      (x) => x.numVal === targetVal,
      (x, currNode) => currNode.numVal - x.numVal <= 1
    )
  );
};

part1();
// part2();
