import nreadlines from 'n-readlines';
import * as yargs from 'yargs';

const args = yargs
  .option('inputFile', {
    alias: 'i',
    demand: true,
    type: 'string',
  })
  .check((a) => {
    if (!a.inputFile) {
      return 'Input file cannot be an empty string!';
    }
    return true;
  })
  .parseSync();

console.log('args.inputFile:', args.inputFile);
console.log('----');

function parseInput() {
  const liner = new nreadlines(args.inputFile);

  const connections = new Map<string, string[]>();

  let line;
  while ((line = liner.next())) {
    // lines.push(line.toString());
    const [from, to] = line.toString().split('-');

    if (connections.has(from)) {
      connections.set(from, [...connections.get(from)!, to]);
    } else {
      connections.set(from, [to]);
    }

    if (connections.has(to)) {
      connections.set(to, [...connections.get(to)!, from]);
    } else {
      connections.set(to, [from]);
    }
  }

  return connections;
}

function part1Solution(connections: Map<string, string[]>) {
  const visitedSmallCaves = new Set<string>();
  // const startNeighbors = connections.get('start')!;

  const sum = proceedFromCavePart1('start', connections, visitedSmallCaves);
  // console.log('sum: ', sum);
  return sum;
}

function proceedFromCavePart1(
  caveName: string,
  connections: Map<string, string[]>,
  visitedSmallCaves: Set<string>
): number {
  if (caveName === 'end') {
    // push path or sth
    return 1;
  }
  if (isSmallCave(caveName)) {
    visitedSmallCaves.add(caveName);
  }

  const caveNeighbors = connections.get(caveName)!;

  const neighborsToVisit = caveNeighbors.filter((cn) => cn !== 'start' && !visitedSmallCaves.has(cn));

  if (neighborsToVisit.length === 0) {
    // we have nowhere to go - got here from either 'start' or a small cave, therefore cannot return
    return 0;
  }

  let tmpSum = 0;
  for (let ntv of neighborsToVisit) {
    tmpSum += proceedFromCavePart1(ntv, connections, visitedSmallCaves);
    if (isSmallCave(ntv) && visitedSmallCaves.has(ntv)) {
      visitedSmallCaves.delete(ntv);
    }
  }

  return tmpSum;
}

function part2Solution(connections: Map<string, string[]>) {
  const visitedSmallCaves = new Map<string, 1 | 2>();
  // const startNeighbors = connections.get('start')!;

  const currentPath: string[] = [];

  const sum = proceedFromCavePart2('start', connections, visitedSmallCaves, currentPath);
  // console.log('sum: ', sum);
  return sum;
}

function proceedFromCavePart2(
  caveName: string,
  connections: Map<string, string[]>,
  visitedSmallCaves: Map<string, 1 | 2>,
  currentPath: string[]
): number {
  currentPath.push(caveName);
  if (caveName === 'end') {
    // console.log(currentPath.join(','));
    currentPath.pop();
    return 1;
  }
  if (isSmallCave(caveName)) {
    if (visitedSmallCaves.has(caveName)) {
      // must have been <caveName, 1>
      // if (visitedSmallCaves.get(caveName) === 2) {
      //   console.log('WARN');
      // }
      visitedSmallCaves.set(caveName, 2); // increase visits to 2
    } else {
      visitedSmallCaves.set(caveName, 1); // else set with one visit
    }
  }

  const caveNeighbors = connections.get(caveName)!;

  // const neighborsToVisit = caveNeighbors.filter((cn) => cn !== 'start' && visitedSmallCaves.get(cn) !== 2); // OLD - misunderstood assignment

  let oneSmallCaveVisitedTwice = false;
  for (let [, vscValue] of visitedSmallCaves.entries()) {
    if (vscValue === 2) {
      oneSmallCaveVisitedTwice = true;
      break;
    }
  }

  let neighborsToVisit: string[];
  if (oneSmallCaveVisitedTwice) {
    neighborsToVisit = caveNeighbors.filter((cn) => cn !== 'start' && !visitedSmallCaves.has(cn));
  } else {
    neighborsToVisit = caveNeighbors.filter((cn) => cn !== 'start' && visitedSmallCaves.get(cn) !== 2);
  }

  if (neighborsToVisit.length === 0) {
    // console.log('--BAD reached: ', currentPath.join(','));
    currentPath.pop();
    return 0;
  }

  let tmpSum = 0;
  for (let ntv of neighborsToVisit) {
    tmpSum += proceedFromCavePart2(ntv, connections, visitedSmallCaves, currentPath);
    if (isSmallCave(ntv) && visitedSmallCaves.has(ntv)) {
      if (visitedSmallCaves.get(ntv) === 2) {
        visitedSmallCaves.set(ntv, 1);
      } else {
        visitedSmallCaves.delete(ntv);
      }
    }
  }

  currentPath.pop();

  return tmpSum;
}

function isSmallCave(caveName: string) {
  if (caveName !== 'start' && caveName !== 'end' && caveName === caveName.toLowerCase()) {
    return true;
  } else {
    return false;
  }
}

const connections = parseInput();
// console.log(connections);
const part1Sol = part1Solution(connections);
const part2Sol = part2Solution(connections);
console.log('part1Solution:', part1Sol);
console.log('part2Solution:', part2Sol);
