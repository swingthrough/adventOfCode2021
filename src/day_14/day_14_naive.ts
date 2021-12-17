import nreadlines from 'n-readlines';
import * as yargs from 'yargs';
import { number, string } from 'yargs';

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

  const insertionRules: Map<string, string> = new Map();
  lines
    .slice(2)
    .map((l) => l.split(' -> '))
    .forEach((entry) => insertionRules.set(entry[0], entry[1]));

  return {
    polymerTemplate: lines[0],
    insertionRules,
  };
}

class PolymerBuild {
  stepCount = 0;
  readonly polymerTemplate: string;
  polymer: string;
  insertionRules: Map<string, string>;

  constructor(polymerTemplate: string, insertionRules: Map<string, string>) {
    this.polymerTemplate = polymerTemplate;
    this.polymer = this.polymerTemplate;
    this.insertionRules = insertionRules;
  }

  step() {
    let newPolymer = '';
    for (let i = 0; i < this.polymer.length - 1; i++) {
      const ruleLeft = this.polymer.substring(i, i + 2);
      if (!this.insertionRules.has(ruleLeft)) {
        throw new Error(`No insertion rule for '${ruleLeft}'`);
      }
      const ruleRight = this.insertionRules.get(ruleLeft)!;
      newPolymer += this.polymer.charAt(i) + ruleRight;
    }
    // add the last char
    newPolymer += this.polymer.charAt(this.polymer.length - 1);

    this.polymer = newPolymer;
    this.stepCount++;
  }

  steps(numOfSteps: number) {
    for (let i = 0; i < numOfSteps; i++) {
      this.step();
    }
  }

  getStepCount() {
    return this.stepCount;
  }

  getPolymer() {
    return this.polymer;
  }

  getMostAndLeastCommon() {
    const counts = new Map<string, number>();

    for (const c of this.polymer) {
      if (counts.has(c)) {
        counts.set(c, counts.get(c)! + 1);
      } else {
        counts.set(c, 1);
      }
    }

    const sorted = [...counts].sort((a, b) => a[1] - b[1]);
    // console.log(sorted);
    return {
      leastCommon: sorted[0],
      mostCommon: sorted[sorted.length - 1],
    };
  }
}

// function part1Solution(polymerTemplate: string, insertionRules: Map<string, string>) {
//   for (let i = 0; i < )
// }

function part1Solution(polymerTemplate: string, insertionRules: Map<string, string>) {
  const polymerBuild = new PolymerBuild(polymerTemplate, insertionRules);
  polymerBuild.steps(10);
  const { leastCommon, mostCommon } = polymerBuild.getMostAndLeastCommon();
  return mostCommon[1] - leastCommon[1];
}

/**
 * Way too memory expensive
 * FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
 * @param polymerTemplate
 * @param insertionRules
 * @returns
 */
function part2Solution(polymerTemplate: string, insertionRules: Map<string, string>) {
  const polymerBuild = new PolymerBuild(polymerTemplate, insertionRules);
  polymerBuild.steps(40);
  const { leastCommon, mostCommon } = polymerBuild.getMostAndLeastCommon();
  return mostCommon[1] - leastCommon[1];
}

const { polymerTemplate, insertionRules } = parseInput();

console.log('part1Solution: ', part1Solution(polymerTemplate, insertionRules));
// console.log('part2Solution: ', part2Solution(polymerTemplate, insertionRules));
