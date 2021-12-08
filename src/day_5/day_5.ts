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

interface Point {
  x: number;
  y: number;
}

interface Line {
  p1: Point;
  p2: Point;
}

function parseInput() {
  const liner = new nreadlines(args.inputFile);

  const parsedLines: Line[] = [];

  let line;
  while ((line = liner.next())) {
    const [[x1, y1], [x2, y2]] = line
      .toString()
      .split('->')
      .map((xy) =>
        xy
          .trim()
          .split(',')
          .map((c) => parseInt(c))
      );
    // console.log(`${x1}|${y1} ||| ${x2}|${y2}`);
    parsedLines.push({
      p1: { x: x1, y: y1 },
      p2: { x: x2, y: y2 },
    });
  }

  return parsedLines;
}

function getOceanFloorScan(lines: Line[], includeDiagonal45deg: boolean) {
  const map = new Map<string, number>();

  lines.forEach((l) => {
    if (l.p1.x === l.p2.x) {
      const ran = rangeBetweenIncl(l.p1.y, l.p2.y);
      ran.forEach((n) => {
        const ex = map.get(keyFromPoint({ x: l.p1.x, y: n }));
        map.set(keyFromPoint({ x: l.p1.x, y: n }), ex ? ex + 1 : 1);
      });
    } else if (l.p1.y === l.p2.y) {
      const ran = rangeBetweenIncl(l.p1.x, l.p2.x);
      ran.forEach((n) => {
        const ex = map.get(keyFromPoint({ x: n, y: l.p1.y }));
        map.set(keyFromPoint({ x: n, y: l.p1.y }), ex ? ex + 1 : 1);
      });
    } else if (includeDiagonal45deg) {
      const distX = Math.abs(l.p1.x - l.p2.x);
      const distY = Math.abs(l.p1.y - l.p2.y);
      if (distX === distY) {
        // find points in between
        const xRan = rangeBetweenInclPreserveOrder(l.p1.x, l.p2.x);
        const yRan = rangeBetweenInclPreserveOrder(l.p1.y, l.p2.y);
        // xRan and yRan should be the same length here
        for (let i = 0; i < xRan.length; i++) {
          const ex = map.get(keyFromPoint({ x: xRan[i], y: yRan[i] }));
          map.set(keyFromPoint({ x: xRan[i], y: yRan[i] }), ex ? ex + 1 : 1);
        }
      }
    }
  });

  return map;
}

const rangeBetweenIncl = (start: number, end: number) => {
  const [s, e] = end >= start ? [start, end] : [end, start];
  const length = e - s + 1;
  return Array.from({ length }, (_, i) => s + i);
};

const rangeBetweenInclPreserveOrder = (start: number, end: number) => {
  const length = Math.abs(end - start) + 1;
  return Array.from({ length }, (_, i) => start + Math.sign(end - start) * i);
};

function keyFromPoint(point: Point) {
  return `${point.x},${point.y}`;
}

function part1Solution() {
  const map = getOceanFloorScan(parseInput(), false);
  let dangerAreaCount = 0;
  map.forEach((value, key) => {
    if (value > 1) {
      dangerAreaCount++;
    }
  });
  return dangerAreaCount;
}

function part2Solution() {
  const map = getOceanFloorScan(parseInput(), true);
  let dangerAreaCount = 0;
  map.forEach((value, key) => {
    if (value > 1) {
      dangerAreaCount++;
    }
  });
  return dangerAreaCount;
}

console.log('part1Solution: ', part1Solution());
console.log('part1Solution: ', part2Solution());

// const map = getOceanFloorScan(parseInput(), true);

// map.forEach((value, key) => {
//   console.log(`(${key}): ${value}`);
// });

// console.log(rangeBetweenInclPreserveOrder(2, 4));
// console.log(rangeBetweenInclPreserveOrder(4, 2));
// console.log(rangeBetweenInclPreserveOrder(2, 2));
