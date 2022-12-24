import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Operation = "+" | "-" | "*" | "/";

interface Terminal {
  name?: string;
  value: number;
}

interface NonTerminal {
  name?: string;
  leftNode: Node;
  rightNode: Node;
  operation: Operation;
}

type Node = Terminal | NonTerminal;

const isTerminal = (node: Node): node is Terminal => "value" in node;

const monkeys = input.split("\n").map((line) => {
  const [name, job] = line.split(":");
  const [matchNonTerminal, operand1, operation, operand2] =
    /(\w+) ([\+\-\*/]) (\w+)/.exec(job.trim()) || [];
  if (matchNonTerminal) {
    return { name, operand1, operand2, operation };
  }
  return { name, value: +job };
});

const buildTree = (name: string): Node => {
  const monkey = monkeys.find((x) => x.name === name)!;
  if (typeof monkey.value === "number") {
    return { name: monkey.name, value: monkey.value };
  }
  return {
    name: monkey.name,
    operation: monkey.operation as Operation,
    leftNode: buildTree(monkey.operand1),
    rightNode: buildTree(monkey.operand2),
  };
};

const solve = (node: Node): number => {
  if (isTerminal(node)) return node.value;
  const valLeft = solve(node.leftNode);
  const valRight = solve(node.rightNode);
  switch (node.operation) {
    case "+":
      return valLeft + valRight;
    case "-":
      return valLeft - valRight;
    case "*":
      return valLeft * valRight;
    case "/":
      return valLeft / valRight;
  }
};

const contains = (node: Node, name: string): boolean => {
  if (node.name === name) return true;
  if (isTerminal(node)) return false;
  return contains(node.leftNode, name) || contains(node.rightNode, name);
};

function part1() {
  const rootNode = buildTree("root");
  console.log(solve(rootNode));
}

function part2() {
  const rootNode = buildTree("root");
  if (isTerminal(rootNode)) throw "bad input";

  let isLeft = contains(rootNode.leftNode, "humn");
  let rootNodeValue = isLeft ? rootNode.rightNode : rootNode.leftNode;

  let isTransforming = true;
  let node = isLeft ? rootNode.leftNode : rootNode.rightNode;
  while (isTransforming) {
    if (isTerminal(node)) throw "not good...";

    isLeft = contains(node.leftNode, "humn");
    switch (node.operation) {
      case "+": {
        rootNodeValue = {
          leftNode: rootNodeValue,
          rightNode: isLeft ? node.rightNode : node.leftNode,
          operation: "-",
        };
        break;
      }
      case "*": {
        rootNodeValue = {
          leftNode: rootNodeValue,
          rightNode: isLeft ? node.rightNode : node.leftNode,
          operation: "/",
        };
        break;
      }
      case "-": {
        rootNodeValue = {
          leftNode: isLeft ? rootNodeValue : node.leftNode,
          rightNode: isLeft ? node.rightNode : rootNodeValue,
          operation: isLeft ? "+" : "-",
        };
        break;
      }
      case "/": {
        rootNodeValue = {
          leftNode: isLeft ? rootNodeValue : node.leftNode,
          rightNode: isLeft ? node.rightNode : rootNodeValue,
          operation: isLeft ? "*" : "/",
        };
        break;
      }
    }

    node = isLeft ? node.leftNode : node.rightNode;
    isTransforming = node.name !== "humn";
  }

  const result = solve(rootNodeValue);
  console.log(result);
}

part1();
// part2();
