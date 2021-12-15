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

  const lines: string[] = [];

  let line;
  while ((line = liner.next())) {
    lines.push(line.toString());
  }
  return lines;
}

// type OPEN_CHAR = '(' | '[' | '{' | '<';
// type CLOSE_CHAR = ')' | ']' | '}' | '>';
const CLOSE_OPEN: {
  [key: string]: string;
} = {
  ')': '(',
  ']': '[',
  '}': '{',
  '>': '<',
};

const OPEN_CLOSE: {
  [key: string]: string;
} = {
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
};

const SCORES_PART_1: {
  [key: string]: number;
} = {
  ')': 3,
  ']': 57,
  '}': 1197,
  '>': 25137,
};

const SCORES_PART_2: {
  [key: string]: number;
} = {
  ')': 1,
  ']': 2,
  '}': 3,
  '>': 4,
};

function part1Solution() {
  const lines = parseInput();
  let totalScore = 0;
  for (let [index, line] of lines.entries()) {
    const stack: string[] = [];
    for (let c of line) {
      if (stack.length === 0 || stack[stack.length - 1] !== CLOSE_OPEN[c]) {
        if (Object.values(CLOSE_OPEN).includes(c)) {
          stack.push(c); // if it's an opening char push it to stack
        } else {
          // it's a closing char and top of stack doesn't have respective opening
          // therefore this one is invalid
          totalScore += SCORES_PART_1[c];
          break;
        }
      } else {
        stack.pop();
      }
    }
    // console.log(`line ${index} end stack length: `, stack.length);
  }

  return totalScore;
}

function part2Solution() {
  const lines = parseInput();
  let completionScores: number[] = [];
  for (let [index, line] of lines.entries()) {
    let isInvalidLine = false;
    const stack: string[] = [];
    for (let c of line) {
      if (stack.length === 0 || stack[stack.length - 1] !== CLOSE_OPEN[c]) {
        if (Object.values(CLOSE_OPEN).includes(c)) {
          stack.push(c); // if it's an opening char push it to stack
        } else {
          // it's a closing char and top of stack doesn't have respective opening
          // therefore this one is invalid
          isInvalidLine = true;
          break;
        }
      } else {
        stack.pop();
      }
    }

    if (!isInvalidLine) {
      const completionStringScore = stack.reduceRight((total, c) => {
        return 5 * total + SCORES_PART_2[OPEN_CLOSE[c]];
      }, 0);
      // console.log(`line ${index} completionStringScore: `, completionStringScore);
      completionScores.push(completionStringScore);
    }
  }
  return completionScores.sort((a, b) => a - b)[Math.floor(completionScores.length / 2)];
}

console.log('part1Solution:', part1Solution());

console.log('part2Solution:', part2Solution());
