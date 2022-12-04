import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, {
  encoding: "utf-8",
}).split("\n");

type SectionAssignment = [number, number];
type AssignmentPair = [SectionAssignment, SectionAssignment];

const assignments = input.map<AssignmentPair>((line) => {
  const [_match, b1, e1, b2, e2] =
    /^(\d+)\-(\d+),(\d+)\-(\d+)$/.exec(line) || [];
  return [
    [+b1, +e1],
    [+b2, +e2],
  ];
});

function part1() {
  const fullyContains = (lhs: SectionAssignment, rhs: SectionAssignment) => {
    return lhs[0] <= rhs[0] && lhs[1] >= rhs[1];
  };
  const fullyContainedAssignments = assignments.filter(
    ([lhs, rhs]) => fullyContains(lhs, rhs) || fullyContains(rhs, lhs)
  );
  console.log(fullyContainedAssignments.length);
}

function part2() {
  const overlaps = (lhs: SectionAssignment, rhs: SectionAssignment) => {
    return lhs[0] >= rhs[0] && lhs[0] <= rhs[1];
  };
  const overlappingAssignments = assignments.filter(
    ([lhs, rhs]) => overlaps(lhs, rhs) || overlaps(rhs, lhs)
  );
  console.log(overlappingAssignments.length);
}

part1();
// part2();
