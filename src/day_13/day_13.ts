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

interface FoldInstruction {
  axis: string;
  value: number;
}

function getMaxXandYFromPoints(points: Point[]) {
  let maxX = -1;
  let maxY = -1;
  points.forEach((point) => {
    if (point.x > maxX) {
      maxX = point.x;
    }
    if (point.y > maxY) {
      maxY = point.y;
    }
  });

  return { maxX, maxY };
}

function parseInput() {
  const liner = new nreadlines(args.inputFile);

  const lines: string[] = [];

  let line;
  while ((line = liner.next())) {
    lines.push(line.toString());
  }

  const coords: Point[] = lines
    .slice(0, lines.indexOf(''))
    .map((c) => c.split(','))
    .map(([x, y]) => ({ x: parseInt(x), y: parseInt(y) }));
  const foldInstructions: FoldInstruction[] = lines.slice(lines.indexOf('') + 1).map((i) => {
    const [axis, valueStr] = i.split('along ')[1].split('=');
    return {
      axis,
      value: parseInt(valueStr),
    };
  });
  // console.log('foldInstructions: ', foldInstructions);
  return {
    coords,
    foldInstructions,
  };
}

class Paper {
  private pointStrSet: Set<string>;

  paperSizeHorizontal: number;
  paperSizeVertical: number;

  constructor(coordsArr: Point[]) {
    const { maxX, maxY } = getMaxXandYFromPoints(coordsArr);
    this.paperSizeHorizontal = maxX + 1;
    this.paperSizeVertical = maxY + 1;
    this.pointStrSet = new Set<string>(coordsArr.map((c) => this.pointToStr(c)));
  }

  getPointCount() {
    console.log(this.pointStrSet);
  }

  countPoints() {
    return this.pointStrSet.size;
  }

  private pointFromStr(pointStr: string): Point {
    const [x, y] = pointStr.split(',').map((s) => parseInt(s));
    return { x, y };
  }

  private pointToStr(point: Point): string {
    return `${point.x},${point.y}`;
  }

  printField() {
    const field: string[][] = [];
    for (let i = 0; i < this.paperSizeVertical; i++) {
      field[i] = [];
      for (let j = 0; j < this.paperSizeHorizontal; j++) {
        field[i][j] = '.';
      }
    }

    const points: Point[] = [...this.pointStrSet].map((p) => this.pointFromStr(p));

    points.forEach((p) => {
      field[p.y][p.x] = '#';
    });

    for (let i = 0; i < this.paperSizeVertical; i++) {
      console.log(field[i].join(''));
    }
  }

  fold({ axis, value }: FoldInstruction) {
    if (axis === 'x') {
      console.log(`[folding] along x=${value}`);
      this.foldAlongX(value);
    } else if (axis === 'y') {
      console.log(`[folding] along y=${value}`);
      this.foldAlongY(value);
    } else {
      throw new Error(`Invalid axis '${axis}'`);
    }
  }

  foldAlongX(xAxis: number) {
    const points = [...this.pointStrSet].map((pointStr) => this.pointFromStr(pointStr));

    const originalRemainingPointsStrings: string[] = points
      .filter((point) => point.x < xAxis)
      .map((point) => this.pointToStr(point));

    const foldedPointStrings: string[] = points
      .filter((point) => point.x > xAxis)
      .map((point) =>
        this.pointToStr({
          x: xAxis - (point.x - xAxis),
          y: point.y,
        })
      );

    this.pointStrSet = new Set([...originalRemainingPointsStrings, ...foldedPointStrings]);

    this.paperSizeHorizontal = xAxis;
  }

  foldAlongY(yAxis: number) {
    const points = [...this.pointStrSet].map((pointStr) => this.pointFromStr(pointStr));

    const originalRemainingPointsStrings: string[] = points
      .filter((point) => point.y < yAxis)
      .map((point) => this.pointToStr(point));

    const foldedPointStrings: string[] = points
      .filter((point) => point.y > yAxis)
      .map((point) =>
        this.pointToStr({
          x: point.x,
          y: yAxis - (point.y - yAxis),
        })
      );

    this.pointStrSet = new Set([...originalRemainingPointsStrings, ...foldedPointStrings]);

    this.paperSizeVertical = yAxis;
  }
}

const { coords, foldInstructions } = parseInput();
// console.log(foldInstructions);
const paper = new Paper(coords);
paper.fold(foldInstructions[0]);
console.log('part 1 solution (points count after one fold): ', paper.countPoints());

for (let i = 1; i < foldInstructions.length; i++) {
  paper.fold(foldInstructions[i]);
}

paper.printField();
console.log('part 2 solution (points count after all folds): ', paper.countPoints());
