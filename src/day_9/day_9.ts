import nreadlines from 'n-readlines';
import * as yargs from 'yargs';

import * as util from 'util';

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

  const heightMap: number[][] = [];

  let line;
  while ((line = liner.next())) {
    heightMap.push(
      line
        .toString()
        .split('')
        .map((c) => parseInt(c))
    );
  }

  return heightMap;
}

interface Position {
  row: number;
  col: number;
}

const RELATIVE_NEIGHBORS_HV: Position[] = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

function getNeighborsHV(x: number, y: number, rows: number, cols: number): Position[] {
  return RELATIVE_NEIGHBORS_HV.map<Position>((rn) => ({
    row: x + rn.row,
    col: y + rn.col,
  })).filter((n) => n.row >= 0 && n.row < rows && n.col >= 0 && n.col < cols); // filter out invalid ones (out of bounds of 2d array)
}

function findLowPoints(heightMap: number[][]) {
  const lowPoints: Position[] = [];

  const rowCount = heightMap.length;
  const colCount = heightMap[0].length;
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const neighborsHV = getNeighborsHV(row, col, rowCount, colCount);
      // console.log(
      //   `heightMap[${row}][${col}]-(${heightMap[row][col]}) neighbors: `,
      //   util.inspect(neighborsHV, { colors: true, compact: true })
      // );
      const lowerOrEqualNeighbors = neighborsHV.filter((n) => heightMap[n.row][n.col] <= heightMap[row][col]);
      if (lowerOrEqualNeighbors.length === 0) {
        // console.log(`lowPoint - heightMap[${row}][${col}]-(${heightMap[row][col]})`);
        lowPoints.push({ row, col });
      }
    }
  }

  return lowPoints;
}

function part1Solution(heightMap: number[][]) {
  const lowPoints = findLowPoints(heightMap);
  // console.log(lowPoints);
  const riskLevel = lowPoints.reduce((sum, lp) => sum + heightMap[lp.row][lp.col] + 1, 0);
  return riskLevel;
}

function isEqualPosition(a: Position, b: Position) {
  return a.row === b.row && a.col === b.col;
}

function arrIncludesPosition(posArr: Position[], pos: Position) {
  return posArr.filter((p) => isEqualPosition(p, pos)).length > 0;
}

function part2Solution(heightMap: number[][]) {
  const rowCount = heightMap.length;
  const colCount = heightMap[0].length;

  const lowPoints = findLowPoints(heightMap);

  const basinSizes: number[] = [];

  for (let lp of lowPoints) {
    let basinSize = 0;
    const visited: Position[] = [];
    const opened: Position[] = [];
    const consider: Position[] = [];

    consider.push(lp);

    while (consider.length !== 0) {
      const p = consider.shift()!;
      visited.push(p);
      basinSize++;

      const neighbors = getNeighborsHV(p.row, p.col, rowCount, colCount);
      const notYetOpenedNeighbors = neighbors.filter(
        (n) => !arrIncludesPosition(opened, n) && heightMap[n.row][n.col] !== 9
      );
      opened.push(...notYetOpenedNeighbors);

      const newNeighbors = notYetOpenedNeighbors.filter(
        (n) => !arrIncludesPosition(visited, n) && heightMap[n.row][n.col] !== 9
      );

      // console.log('p: ', p);
      // console.log('newNeighbors: ', newNeighbors);
      // console.log('consider before push: ', consider);
      // console.log('visited: ', visited);

      consider.push(...newNeighbors);

      // console.log('consider after push: ', consider);
    }

    basinSizes.push(basinSize);
  }

  // console.log('basinSizes: ', basinSizes);
  return basinSizes
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((t, c) => t * c, 1);
}

const input = parseInput();
// console.table(heightMap);
// console.log(util.inspect(heightMap, { colors: true, compact: true }));

console.log('part1Sol: ', part1Solution(input));
console.log('part2Sol: ', part2Solution(input));
