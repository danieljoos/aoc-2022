import { readFileSync } from "fs";

const input = readFileSync(`${__dirname}/input.txt`, { encoding: "utf-8" });

type Node = FileNode | DirNode;

interface FileNode {
  type: "file";
  name: string;
  size: number;
}

interface DirNode {
  type: "dir";
  name: string;
  nodes: Node[];
}

const isDir = (node: Node): node is DirNode => node.type === "dir";
const isFile = (node: Node): node is FileNode => node.type === "file";

function parseInput(): DirNode {
  const rootNode: Node = { type: "dir", name: "/", nodes: [] };
  let wd: DirNode[] = [rootNode];
  const lines = input.split("\n");
  let cursor = 0;

  const parseLs = () => {
    while (cursor < lines.length) {
      const line = lines[cursor++];
      const cwd = wd[wd.length - 1];

      if (line.startsWith("$")) {
        cursor--;
        return;
      }

      const [lsDir, dirName] = /^dir (\w+)$/.exec(line) || [];
      if (lsDir) {
        const existingDir = cwd.nodes.find(
          (x) => isDir(x) && x.name === dirName
        );
        if (!existingDir) {
          const dir: DirNode = {
            type: "dir",
            name: dirName,
            nodes: [],
          };
          cwd.nodes.push(dir);
        }
        continue;
      }

      const [lsFile, fileSize, fileName] = /^(\d+) ([\w\.]+)$/.exec(line) || [];
      if (lsFile) {
        const existingFile = cwd.nodes.find(
          (x) => isFile(x) && x.name === fileName
        );
        if (!existingFile) {
          const file: FileNode = {
            type: "file",
            name: fileName,
            size: +fileSize,
          };
          cwd.nodes.push(file);
        }
        continue;
      }
    }
  };

  const parseCd = (arg: string) => {
    switch (arg) {
      case "/": {
        wd = [rootNode];
        break;
      }
      case "..": {
        if (wd.length > 1) {
          wd.pop();
        }
        break;
      }
      default: {
        const cwd = wd[wd.length - 1];
        const dir = cwd.nodes.find((x) => isDir(x) && x.name === arg);
        if (dir && isDir(dir)) {
          wd.push(dir);
        }
        break;
      }
    }
  };

  while (cursor < lines.length) {
    const line = lines[cursor++];
    const [_match, cmd, arg] = /^\$ (\w+)(?: ([\w\.]+))?$/.exec(line) || [];
    switch (cmd) {
      case "cd": {
        parseCd(arg);
        break;
      }
      case "ls": {
        parseLs();
        break;
      }
    }
  }

  return rootNode;
}

function dirSize(
  dir: DirNode,
  pred?: (dir: DirNode, size: number) => void
): number {
  let result = 0;
  for (const node of dir.nodes) {
    if (isFile(node)) {
      result += node.size;
    } else if (isDir(node)) {
      result += dirSize(node, pred);
    }
  }
  pred?.(dir, result);
  return result;
}

function part1() {
  let total = 0;
  dirSize(parseInput(), (dir, size) => {
    if (size <= 100000) {
      total += size;
    }
  });
  console.log(total);
}

function part2() {
  const dirs: (DirNode & { size: number })[] = [];
  const used = dirSize(parseInput(), (dir, size) => {
    dirs.push({ ...dir, size });
  });
  const required = 30000000 - (70000000 - used);
  const candidates = dirs
    .filter((x) => x.size > required)
    .sort((lhs, rhs) => lhs.size - rhs.size);
  console.log(candidates[0].size);
}

part1();
// part2();
