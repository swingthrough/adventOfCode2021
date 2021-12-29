import nreadlines from 'n-readlines';
import * as yargs from 'yargs';
import {
  mirrorHorizontal,
  rotate180Right,
  rotate270Right,
  rotate90Right,
  stringifyMatrix,
} from './matrixUtils';

import colors from 'colors';

import { performance } from 'perf_hooks';

const args = yargs
  .option('inputBricks', {
    alias: 'b',
    demand: true,
    type: 'string',
    description: 'Bricks to use',
  })
  .option('startConfig', {
    alias: 's',
    demand: true,
    type: 'string',
    description: 'Brick setup to solve',
  })
  .check((a) => {
    if (!a.inputBricks) {
      return 'Input bricks file cannot be an empty string!';
    }
    if (!a.startConfig) {
      return 'Starting configuration file cannot be an empty string!';
    }
    return true;
  })
  .parseSync();

console.log('args.inputBricks:', args.inputBricks);
console.log('args.startConfig:', args.startConfig);
console.log('----');

/**
 * identity - rotated 0°
 * mirror identity - (mirror is flipped horizontally) - '.XX..' -> '..XX.' for each row
 */

enum Configuration {
  Identity = 'Identity',
  Rot90degRight = 'Rot90degRight',
  Rot180degRight = 'Rot180degRight',
  Rot270degRight = 'Rot270degRight',
  MirrorIdentity = 'MirrorIdentity',
  MirrorRot90degRight = 'MirrorRot90degRight',
  MirrorRot180degRight = 'MirrorRot180degRight',
  MirrorRot270degRight = 'MirrorRot270degRight',
}

class Brick {
  private _name: string;
  private _val: string[][];
  private _char: string;

  constructor(name: string, val: string[][], char: string) {
    this._name = name;
    this._val = val;
    this._char = char;
  }

  get name() {
    return this._name;
  }

  get char() {
    return this._char;
  }

  copy(): Brick {
    const copiedVal = this._val.map((row) => row.slice());
    const newBrick = new Brick(this._name, copiedVal, this._char);
    return newBrick;
  }

  rotate90Right() {
    this._val = rotate90Right(this._val);
  }

  rotate180Right() {
    this._val = rotate180Right(this._val);
  }

  rotate270Right() {
    this._val = rotate270Right(this._val);
  }

  mirrorHorizontal() {
    this._val = mirrorHorizontal(this._val);
  }

  get width() {
    return this._val[0].length;
  }

  get height() {
    return this._val.length;
  }

  charAt(row: number, col: number) {
    return this._val[row][col];
  }
}

function parseInputBricksFile(): string[][] {
  const liner = new nreadlines(args.inputBricks);

  const bricksToParse: string[][] = [];
  let curPartLines: string[] = [];
  let line;
  while ((line = liner.next())) {
    const lineStr = line.toString();
    if (lineStr === '') {
      bricksToParse.push(curPartLines);
      curPartLines = [];
    } else {
      curPartLines.push(lineStr);
    }
  }
  if (curPartLines.length > 0) {
    // add last one in case file does not end with empty line
    bricksToParse.push(curPartLines);
  }

  return bricksToParse;
}

function parseBricks() {
  const bricksToParse = parseInputBricksFile();

  const allBricks: Brick[] = [];

  for (const brickLines of bricksToParse) {
    const brickName = brickLines.shift(); // get and remove the name

    const partVal: string[][] = brickLines.map((pl) => pl.split(''));

    allBricks.push(new Brick(brickName!, partVal, brickName!.charAt(brickName!.indexOf('_') + 1)));
  }

  // TODO: add validation that part char is unique in brick of inputBricks
  // also that it's the only char used within that brick
  // TODO: add validation of startConfig - must contain only bricks from inputBricks
  // that requires all 8 configurations of a brick to be checked against startConfig

  // allParts.forEach((p) => {
  //   console.log(p.name, p.val);
  // });
  return allBricks;
}

interface AddedBrickHistoryEntry {
  row: number;
  col: number;
  brick: Brick;
}

class Field {
  val: string[][];

  private _addedBricksHistory: AddedBrickHistoryEntry[] = [];
  constructor(val: string[][]) {
    this.val = val;
  }

  toString() {
    return this.val.reduce((totalStr, row) => totalStr + row.join('') + '\n', '');
  }

  copy() {
    const copiedVal = this.val.map((row) => row.slice());
    return new Field(copiedVal);
  }

  get width() {
    return this.val[0].length;
  }

  get height() {
    return this.val.length;
  }

  stringifyField() {
    return stringifyMatrix(this.val, '');
  }

  /**
   * Does not check duplicates - whether the same brick is already placed in the field (TODO ?)
   */
  placeBrickIfPossible(brick: Brick, row: number, col: number): boolean {
    if (row < 0 || col < 0) {
      throw new Error(`row and col must be positive numbers, you passed row: ${row}, col: ${col}`);
    }
    if (row + brick.height > this.height) {
      return false; // out of bottom bound vertially
    }
    if (col + brick.width > this.width) {
      return false; // out of right bound horizontally
    }

    // check collisions
    if (this._collides(brick, row, col)) {
      return false;
    }

    this._addBrickForced(brick, row, col);
    this._addedBricksHistory.push({ row, col, brick: brick.copy() });
    return true;
  }

  undo() {
    if (this._addedBricksHistory.length > 0) {
      const historyEntry = this._addedBricksHistory.pop()!;

      for (let i = 0; i < historyEntry.brick.height; i++) {
        for (let j = 0; j < historyEntry.brick.width; j++) {
          if (historyEntry.brick.charAt(i, j) !== '.') {
            this.val[historyEntry.row + i][historyEntry.col + j] = '.';
          }
        }
      }
      return historyEntry.brick;
    }
  }

  private _collides(brick: Brick, row: number, col: number): boolean {
    for (let i = 0; i < brick.height; i++) {
      for (let j = 0; j < brick.width; j++) {
        if (brick.charAt(i, j) !== '.' && this.val[row + i][col + j] !== '.') {
          return true;
        }
      }
    }
    return false;
  }

  private _addBrickForced(brick: Brick, row: number, col: number): void {
    for (let i = 0; i < brick.height; i++) {
      for (let j = 0; j < brick.width; j++) {
        if (brick.charAt(i, j) !== '.') {
          this.val[row + i][col + j] = brick.charAt(i, j);
        }
      }
    }
  }
}

function parseStartConfig(): Field {
  const liner = new nreadlines(args.startConfig);
  const startConfig: string[][] = [];
  let line;
  while ((line = liner.next())) {
    const lineStr = line.toString();
    startConfig.push(lineStr.split(''));
  }

  return new Field(startConfig);
}

function solve(bricks: Brick[], startConfig: Field): boolean {
  // STEPS:
  // 1. check field for bricks that are used on start already
  // 2. loop recursively through remaining bricks to try to fit them

  // STEP 1. -------

  // Find which bricks are already in use (keep only the chars)
  // we can then find the brick via char through charMappedBricks
  // Here we assume the startConfig input is valid and correct chars
  // are used for correct bricks that are defined in inputBricks file
  const usedBrickChars = new Set<string>();
  for (const row of startConfig.val) {
    for (const fieldChar of row) {
      if (fieldChar !== '.') {
        usedBrickChars.add(fieldChar);
      }
    }
  }

  // group remaining (not yet used) bricks on their char
  const charMappedBricks = new Map(bricks.filter((b) => !usedBrickChars.has(b.char)).map((b) => [b.char, b]));

  // console.log('usedBrickChars:', usedBrickChars);
  // console.log('charMappedBricks:', charMappedBricks);

  // ===== TESTING LOGS TO CHECK IF BRICK PLACING WORKS PROPERLY =====
  // const brickW = charMappedBricks.get('W')!;
  // console.log(startConfig.stringifyField());
  // let placed = startConfig.placeBrickIfPossible(brickW, 0, 9);
  // console.log('placed:', placed);
  // console.log(startConfig.stringifyField());
  // placed = startConfig.placeBrickIfPossible(brickW, 0, 8);
  // console.log('placed:', placed);
  // console.log(startConfig.stringifyField());
  // brickW.mirrorHorizontal();
  // placed = startConfig.placeBrickIfPossible(brickW, 0, 8);
  // console.log('placed:', placed);
  // console.log(startConfig.stringifyField());
  // console.log('call startConfig.undo()');
  // startConfig.undo();
  // console.log(startConfig.stringifyField());
  // =================================================================

  const unused: Set<string> = new Set(charMappedBricks.keys());

  // STEP 2. -------

  const solved = solveRecursive(unused, charMappedBricks, startConfig);
  return solved;
}

function solveRecursive(
  unusedBrickChars: Set<string>,
  charMappedBricks: Map<string, Brick>,
  field: Field
): boolean {
  if (unusedBrickChars.size === 0) {
    return true;
  }

  // loop through all unused bricks, based on above condition, there will be at least one
  for (const brickChar of unusedBrickChars) {
    // loop through all configurations of current brick
    for (let conf of Object.values(Configuration)) {
      const brickConfiguration = getBrickConfigurationImmutable(charMappedBricks.get(brickChar)!, conf);

      // loop through all coordinates of the field to try to place this particular brickConfiguration
      for (let i = 0; i <= field.height - brickConfiguration.height; i++) {
        for (let j = 0; j <= field.width - brickConfiguration.width; j++) {
          const wasPlaced = field.placeBrickIfPossible(brickConfiguration, i, j);
          if (wasPlaced) {
            const restOfBrickChars: Set<string> = new Set(
              [...unusedBrickChars].filter((b) => b !== brickChar)
            );
            const solved = solveRecursive(restOfBrickChars, charMappedBricks, field);
            if (solved) {
              return true;
            } else {
              // We get here if this brickConfiguration was placed at (i,j), but somewhere down
              // the line, next bricks could not be placed and therefore it didn't solve, so
              // undo this brick's placement and continue trying to place it at next coordinates
              field.undo();
              continue;
            }
          }
          // We only get here if it wasn't placed at (i,j) coordinates, therefore
          // continue loop, trying to place this brickConfiguration at next coordinates
        }
      }
      // We get here if this particular brickConfiguration wasn't placed at any coordinates
      // continue loop to try the next brick configuration
    }
    // we only get here if the configurations loop ended without return, therefore didn't place any configuration
    // for this brick, we can return now as there is no point in trying the rest of the bricks if this one didn't
    // fit anywhere - it won't fit deeper down the line either
    // we need to get back out of recursion and try different placement of previous bricks
    return false;
  }

  // Based on the first condition of this function (returning if no more unused bricks), we should be able
  // to get inside the first loop as there is at least one brick char, and that loop returns on each
  // possible conditions that could potentially happen
  throw new Error('Should not get here!');
}

function assertUnreachable(val: never): never {
  throw new Error(`Didn't expect to get here, val=${val}`);
}

function getBrickConfigurationImmutable(brick: Brick, configuration: Configuration): Brick {
  const copy = brick.copy();

  switch (configuration) {
    case Configuration.Identity:
      return copy;
    case Configuration.Rot90degRight:
      copy.rotate90Right();
      return copy;
    case Configuration.Rot180degRight:
      copy.rotate180Right();
      return copy;
    case Configuration.Rot270degRight:
      copy.rotate270Right();
      return copy;
    case Configuration.MirrorIdentity:
      copy.mirrorHorizontal();
      return copy;
    case Configuration.MirrorRot90degRight:
      copy.mirrorHorizontal();
      copy.rotate90Right();
      return copy;
    case Configuration.MirrorRot180degRight:
      copy.mirrorHorizontal();
      copy.rotate180Right();
      return copy;
    case Configuration.MirrorRot270degRight:
      copy.mirrorHorizontal();
      copy.rotate270Right();
      return copy;
    default:
      return assertUnreachable(configuration);
  }
}

const COLOR_MAPPING: { [key: string]: string } = {
  V: 'V'['bgGray' as any],
  l: 'l'.bgBlue,
  '^': '^'['bgBrightBlue' as any],
  P: 'P'.bgCyan,
  L: 'L'['bgBrightRed' as any],
  S: 'S'.bgRed,
  C: 'C'['bgBrightGreen' as any],
  T: 'T'.bgWhite,
  W: 'W'.bgMagenta,
  Z: 'Z'['bgBrightMagenta' as any],
  Q: 'Q'.bgBlack,
  Y: 'Y'.bgYellow,
};

function coloredStringWIP(str: string) {
  return str
    .split('')
    .map((c) => (COLOR_MAPPING[c] ? COLOR_MAPPING[c] : c))
    .join('');
}

function formatMilliseconds(millis: number): string {
  const minutes = Math.floor(millis / 60000);
  const seconds = (millis % 60000) / 1000;

  return `${minutes} minutes, ${seconds.toFixed(4)} seconds`;
}

const bricks = parseBricks();
const startConfig = parseStartConfig();

console.log(colors.red('Starting configuration: '));
console.log(coloredStringWIP(startConfig.stringifyField()));

console.log(colors.green('Solving...'));
const startTime = performance.now();
const solved = solve(bricks, startConfig);
const endTime = performance.now();
const millis = endTime - startTime;

// for some reason there needs to be at least one call to colors here
// for the above mapping to work
console.log(colors.red('Solved: '), solved);
// console.log('solved'.magenta, solved);

console.log(coloredStringWIP(startConfig.stringifyField()));
console.log(colors.red('Solving time: '), formatMilliseconds(millis));

// console.log('bricks:', bricks);
// console.log(startConfig.toString());
