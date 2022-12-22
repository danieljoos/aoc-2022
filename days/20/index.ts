import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

interface ListNode {
  value: number;
  prev: ListNode;
  next: ListNode;
}

const createLinkedList = (nums: number[]): [ListNode, number] => {
  const nodes = nums.map<Partial<ListNode>>((x) => ({ value: x }));
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].prev = nodes[(i + nodes.length - 1) % nodes.length] as ListNode;
    nodes[i].next = nodes[(i + 1) % nodes.length] as ListNode;
  }
  return [nodes[0] as ListNode, nodes.length];
};

const moveUp = (node: ListNode) => {
  const nextNode = node.next;
  nextNode.next.prev = node;
  node.next = nextNode.next;
  nextNode.next = node;
  nextNode.prev = node.prev;
  node.prev.next = nextNode;
  node.prev = nextNode;
};

const moveDown = (node: ListNode) => moveUp(node.prev);

const move = (node: ListNode, delta: number) => {
  if (delta < 0) {
    for (let i = delta; i < 0; i++) {
      moveDown(node);
    }
  } else {
    for (let i = 0; i < delta; i++) {
      moveUp(node);
    }
  }
};

const seek = (node: ListNode, delta: number): ListNode => {
  let cur = node;
  if (delta < 0) {
    for (let i = delta; i < 0; i++) {
      cur = cur.prev;
    }
  } else {
    for (let i = 0; i < delta; i++) {
      cur = cur.next;
    }
  }
  return cur;
};

const map = <T>(node: ListNode, pred: (cur: ListNode) => T): T[] => {
  let cur = node;
  const result: T[] = [];
  do {
    result.push(pred(cur));
    cur = cur.next;
  } while (cur !== node);
  return result;
};

const find = (
  node: ListNode,
  pred: (cur: ListNode) => boolean
): ListNode | undefined => {
  let cur = node;
  do {
    if (pred(cur)) {
      return cur;
    }
    cur = cur.next;
  } while (cur !== node);
};

const mixing = (numbers: number[], count: number) => {
  const [list, len] = createLinkedList(numbers);
  const originalOrder = map(list, (x) => x);
  for (let i = 0; i < count; i++) {
    for (const node of originalOrder) {
      move(node, node.value % (len - 1));
    }
  }
  const zero = find(list, (x) => x.value === 0)!;
  const sum = [1000, 2000, 3000]
    .map((x) => seek(zero, x))
    .reduce((sum, x) => sum + x.value, 0);

  return sum;
};

function part1() {
  const numbers = input.split("\n").map((x) => +x);
  console.log(mixing(numbers, 1));
}

function part2() {
  const decryptionKey = 811589153;
  const numbers = input.split("\n").map((x) => +x * decryptionKey);
  console.log(mixing(numbers, 10));
}

part1();
part2();
