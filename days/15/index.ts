import { readFileSync } from "fs";
const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Coordinates = [number, number];
type Interval = [number, number];

const manhattanDist = ([x1, y1]: Coordinates, [x2, y2]: Coordinates): number =>
  Math.abs(x1 - x2) + Math.abs(y1 - y2);

const mapKey = ([x, y]: Coordinates) => `${x},${y}`;
const mapCoords = (coords: Coordinates[]) =>
  coords.reduce((m, x) => {
    m.set(mapKey(x), x);
    return m;
  }, new Map<string, Coordinates>());

const intervalLen = ([x1, x2]: Interval) => x2 - x1;

// Parse the input data:
// Extract sensor- and beacon positions and calculate their distance.
const re =
  /^Sensor at x=([-\d]+), y=([-\d]+): closest beacon is at x=([-\d]+), y=([-\d]+)$/;
const measurements = input.split("\n").map((x) => {
  const [_match, sx, sy, bx, by] = re.exec(x) || [];
  const sensor: Coordinates = [+sx, +sy];
  const beacon: Coordinates = [+bx, +by];
  const dist = manhattanDist(sensor, beacon);
  return { sensor, beacon, dist };
});
const beaconsMap = mapCoords(measurements.map((x) => x.beacon));
const beacons = Array.from(beaconsMap.values());

function part1() {
  // Have a covered-set for the x-axis.
  // Calculate the distance between the point p (having the same x coord as the sensor).
  // and the sensor. If greater zero, this sensor covers some area on the target y axis.
  // At the end, remove the points that are actual beacons.
  //
  //  ...S...
  //  .......
  //  .##p#B.  (targetY)
  //
  //  (above: dist=4, d=2)
  //
  const targetY = 10;
  // const targetY = 2000000; // uncomment for real input data
  const intervals: Interval[] = [];
  for (const { sensor, dist } of measurements) {
    const p: Coordinates = [sensor[0], targetY];
    const d = dist - manhattanDist(sensor, p);
    if (d > 0) {
      intervals.push([sensor[0] - d, sensor[0] + d]);
    }
  }
  intervals.sort((lhs, rhs) => lhs[0] - rhs[0]);
  for (let i = 1; i < intervals.length; ++i) {
    const curr = intervals[i];
    const prev = intervals[i - 1];
    if (curr[0] < prev[1]) {
      curr[0] = prev[1];
    }
    if (curr[1] < curr[0]) {
      curr[1] = curr[0];
    }
  }
  let len = intervals.map(intervalLen).reduce((sum, x) => sum + x, 1);
  len -= beacons.filter((b) => b[1] === targetY).length;
  console.log(len);
}

function part2() {
  const searchArea: Coordinates = [20, 20];
  // const searchArea: Coordinates = [4000000, 4000000]; // uncomment for real input data

  let percentage = 0;
  for (let y = 0; y <= searchArea[1]; y++) {
    // Again build all intervals for the current row.
    // Similar as in part1.
    const intervals: Interval[] = [];
    for (const { sensor, dist } of measurements) {
      const p: Coordinates = [sensor[0], y];
      const d = dist - manhattanDist(sensor, p);
      if (d <= 0) continue;
      intervals.push([sensor[0] - d, sensor[0] + d]);
    }
    intervals.sort((lhs, rhs) => lhs[0] - rhs[0]);
    for (let i = 1; i < intervals.length; ++i) {
      const curr = intervals[i];
      const prev = intervals[i - 1];
    
      if (curr[0] > prev[1]) {
        // If there is space between two intervals,
        // we've found the location of the distress beacon.
        const p = [curr[0] - 1, y];
        const frequency = p[0] * 4000000 + p[1];
        console.log("Found it", p);
        console.log("Frequency", frequency);
        return;
      }
      if (curr[0] < prev[1]) {
        curr[0] = prev[1];
      }
      if (curr[1] < curr[0]) {
        curr[1] = curr[0];
      }
    }

    // Optional, have some percentage output:
    const p = Math.floor((y * 100) / searchArea[1]);
    if (p !== percentage) {
      percentage = p;
      console.log(p, "%");
    }
  }
}

part1();
// part2();
