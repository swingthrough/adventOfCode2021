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
  insertionRules: Map<string, string>;
  leftRuleCounts: Map<string, number> = new Map();
  charCounts: Map<string, number> = new Map();

  constructor(polymerTemplate: string, insertionRules: Map<string, string>) {
    this.polymerTemplate = polymerTemplate;
    this.insertionRules = insertionRules;
    for (let i = 0; i < polymerTemplate.length - 1; i++) {
      const ruleLeft = polymerTemplate.substring(i, i + 2);
      if (!this.insertionRules.has(ruleLeft)) {
        throw new Error(`No insertion rule for '${ruleLeft}'`);
      }
      if (this.leftRuleCounts.has(ruleLeft)) {
        this.leftRuleCounts.set(ruleLeft, this.leftRuleCounts.get(ruleLeft)! + 1);
      } else {
        this.leftRuleCounts.set(ruleLeft, 1);
      }
    }

    for (const c of polymerTemplate) {
      if (this.charCounts.has(c)) {
        this.charCounts.set(c, this.charCounts.get(c)! + 1);
      } else {
        this.charCounts.set(c, 1);
      }
    }
  }

  step() {
    const newCharCounts: Map<string, number> = new Map([...this.charCounts]);
    const newLeftRuleCounts: Map<string, number> = new Map([...this.leftRuleCounts]);

    for (const [ruleLeft, ruleLeftCount] of this.leftRuleCounts) {
      // if ruleLeftCount is 0 then it cannot expand, continue loop for next ruleLeft
      if (ruleLeftCount === 0) {
        continue;
      }
      const expandsTo = this.insertionRules.get(ruleLeft)!;

      if (newCharCounts.has(expandsTo)) {
        newCharCounts.set(expandsTo, newCharCounts.get(expandsTo)! + ruleLeftCount);
      } else {
        newCharCounts.set(expandsTo, 1);
      }

      /**
       * example for rule NN -> C => NCN
       *
       * - increases char count of C
       * - decreases rule left count of NN
       * - increases rule left count of NC
       * - increases rule left count of CN
       *
       * And these steps happen 'ruleLeftCount' times
       */

      const newRuleLeftInstance1 = ruleLeft.charAt(0) + expandsTo;
      const newRuleLeftInstance2 = expandsTo + ruleLeft.charAt(1);

      // ruleLeft was expanded so decrease it's count (no need to check .has() here, it's definitely there)
      newLeftRuleCounts.set(ruleLeft, newLeftRuleCounts.get(ruleLeft)! - ruleLeftCount);

      // add the newly created rule instance 1
      if (newLeftRuleCounts.has(newRuleLeftInstance1)) {
        newLeftRuleCounts.set(
          newRuleLeftInstance1,
          newLeftRuleCounts.get(newRuleLeftInstance1)! + ruleLeftCount
        );
      } else {
        newLeftRuleCounts.set(newRuleLeftInstance1, ruleLeftCount);
      }

      // add the newly created rule instance 2
      if (newLeftRuleCounts.has(newRuleLeftInstance2)) {
        newLeftRuleCounts.set(
          newRuleLeftInstance2,
          newLeftRuleCounts.get(newRuleLeftInstance2)! + ruleLeftCount
        );
      } else {
        newLeftRuleCounts.set(newRuleLeftInstance2, ruleLeftCount);
      }
    }

    this.leftRuleCounts = newLeftRuleCounts;
    this.charCounts = newCharCounts;
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

  getLeftRuleCounts() {
    return this.leftRuleCounts;
  }

  getCharCounts() {
    return this.charCounts;
  }

  getMostAndLeastCommon() {
    const sorted = [...this.charCounts].sort((a, b) => a[1] - b[1]);
    return {
      leastCommon: sorted[0],
      mostCommon: sorted[sorted.length - 1],
    };
  }
}

function part1Solution(polymerTemplate: string, insertionRules: Map<string, string>) {
  const polymerBuild = new PolymerBuild(polymerTemplate, insertionRules);
  // console.log('leftRuleCounts: ', polymerBuild.getLeftRuleCounts());
  // console.log('charCounts: ', polymerBuild.getCharCounts());
  const steps = 10;
  polymerBuild.steps(steps);
  // console.log(`----after ${steps} steps----`);
  // console.log('leftRuleCounts: ', polymerBuild.getLeftRuleCounts());
  // console.log('charCounts: ', polymerBuild.getCharCounts());

  const { leastCommon, mostCommon } = polymerBuild.getMostAndLeastCommon();
  return mostCommon[1] - leastCommon[1];
}

function part2Solution(polymerTemplate: string, insertionRules: Map<string, string>) {
  const polymerBuild = new PolymerBuild(polymerTemplate, insertionRules);
  polymerBuild.steps(40);

  const { leastCommon, mostCommon } = polymerBuild.getMostAndLeastCommon();
  return mostCommon[1] - leastCommon[1];
}

const { polymerTemplate, insertionRules } = parseInput();

console.log('part1Solution: ', part1Solution(polymerTemplate, insertionRules));
console.log('part2Solution: ', part2Solution(polymerTemplate, insertionRules));
