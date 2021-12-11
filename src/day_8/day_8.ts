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

type Numeral = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type SegmentCount = 2 | 3 | 4 | 5 | 6 | 7;
type NumberSemgentCount = {
  [key in Numeral]: SegmentCount;
};
const NUMBER_SEGMENT_COUNT: NumberSemgentCount = {
  0: 6,
  1: 2,
  2: 5,
  3: 5,
  4: 4,
  5: 5,
  6: 6,
  7: 3,
  8: 7,
  9: 6,
};

type SegmentCountToPotentialNumeral = {
  [key in SegmentCount]: Numeral[];
};

const SEGMENT_COUNT_TO_POTENTIAL_NUMERAL: SegmentCountToPotentialNumeral = {
  2: [1],
  3: [7],
  4: [4],
  5: [2, 3, 5],
  6: [0, 6, 9],
  7: [8],
};

interface Entry {
  sigPatterns: string[];
  output: string[];
}

function parseInput(): Entry[] {
  const liner = new nreadlines(args.inputFile);

  const entries: Entry[] = [];

  let line;
  while ((line = liner.next())) {
    const [sigPatterns, output] = line
      .toString()
      .split(' | ')
      // .map((s) => s.split(' ').map((sig) => sig.split('').sort().join('')));
      .map((s) => s.split(' '));

    // console.log('sigPatterns: ', sigPatterns);
    // console.log('output: ', output);
    entries.push({
      sigPatterns,
      output,
    });
  }
  return entries;
}

function part1Solution(entries: Entry[]) {
  const uniqueNumerals: Numeral[] = [1, 4, 7, 8];
  const lengthsToCheck = uniqueNumerals.map((v) => NUMBER_SEGMENT_COUNT[v]);
  // console.log(lengthsToCheck);
  const totalUniquesSum = entries.reduce((totalSum, { output }) => {
    const uniquesInEntryCount = output.filter((outputSignal) =>
      lengthsToCheck.includes(outputSignal.length as SegmentCount)
    ).length;
    return totalSum + uniquesInEntryCount;
  }, 0);
  return totalUniquesSum;
}

type SEGMENT = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';
type SEGMENT_MASK = 0b1000000 | 0b0100000 | 0b0010000 | 0b0001000 | 0b0000100 | 0b0000010 | 0b0000001;

const segmentsToMasks: {
  [key in SEGMENT]: SEGMENT_MASK;
} = {
  a: 0b1000000,
  b: 0b0100000,
  c: 0b0010000,
  d: 0b0001000,
  e: 0b0000100,
  f: 0b0000010,
  g: 0b0000001,
};

const masksToSegments: {
  [key in SEGMENT_MASK]: SEGMENT;
} = {
  0b1000000: 'a',
  0b0100000: 'b',
  0b0010000: 'c',
  0b0001000: 'd',
  0b0000100: 'e',
  0b0000010: 'f',
  0b0000001: 'g',
};

function bitSetDiff(a: number, b: number): number {
  // set a - set b
  return a & ~b;
}

// a contains b
function bitSetAContainsB(a: number, b: number): boolean {
  return (b & a) === b;
}

type PatternAndMask = {
  pattern: string;
  mask: number;
};

function solvePatterns(sigPatterns: string[]): {
  [key: string]: Numeral;
} {
  const sigPatternsWithMasks: PatternAndMask[] = sigPatterns.map((sp) => {
    return {
      pattern: sp,
      mask: patternToMask(sp),
    };
  });
  // console.log(
  //   'masked Patterns: ',
  //   sigPatternsWithMasks.map((spwm) => ({
  //     ...spwm,
  //     maskStr: getMaskPadded(spwm.mask),
  //   }))
  // );

  const n1 = sigPatternsWithMasks.filter((spwm) => spwm.pattern.length === 2)[0];
  const n4 = sigPatternsWithMasks.filter((spwm) => spwm.pattern.length === 4)[0];
  const n7 = sigPatternsWithMasks.filter((spwm) => spwm.pattern.length === 3)[0];
  const n8 = sigPatternsWithMasks.filter((spwm) => spwm.pattern.length === 7)[0];
  // 7 and 8

  // const wires: PatternAndMask[] = [];

  const w0m = bitSetDiff(n7.mask, n1.mask);
  // wires[0] = {
  //   mask: w0m,
  //   pattern: maskToPattern(w0m),
  // };

  // console.log(`wireMasks[0] with maskStr: `, { ...wires[0], maskStr: getMaskPadded(wires[0].mask) });

  const n3 = sigPatternsWithMasks.filter(
    (spwm) => spwm.pattern.length === 5 && bitSetAContainsB(spwm.mask, n1.mask)
  )[0];

  const w6m = bitSetDiff(bitSetDiff(n3.mask, n4.mask), w0m);
  // wires[6] = {
  //   mask: w6m,
  //   pattern: maskToPattern(w6m),
  // };

  const w4m = bitSetDiff(bitSetDiff(bitSetDiff(n8.mask, n4.mask), n7.mask), w6m);
  // wires[4] = {
  //   mask: w4m,
  //   pattern: maskToPattern(w4m),
  // };

  const n2 = sigPatternsWithMasks.filter(
    (spwm) => spwm.pattern.length === 5 && spwm.mask !== n3.mask && bitSetAContainsB(spwm.mask, w4m)
  )[0];

  const n5 = sigPatternsWithMasks.filter(
    (spwm) => spwm.pattern.length === 5 && spwm.mask !== n3.mask && spwm.mask !== n2.mask
  )[0];

  // We could find out other wires like this:
  // -- copied from: https://github.com/nielsutrecht/adventofcode/blob/master/src/main/kotlin/com/nibado/projects/advent/y2021/Day08.kt
  // wire[1] = (n8 - n3 - n2).single()
  // wire[2] = (n1 - n5).single()
  // wire[5] = (n1 - wire[2]).single()
  // wire[3] = (n4 - setOf(wire[1], wire[2], wire[5])).single()

  // But let's try to just find the rest of the numbers
  const n6 = sigPatternsWithMasks.filter(
    (spwm) => spwm.pattern.length === 6 && bitSetAContainsB(spwm.mask, n1.mask) === false
  )[0];
  const n9 = sigPatternsWithMasks.filter(
    (spwm) => spwm.pattern.length === 6 && bitSetAContainsB(spwm.mask, n4.mask)
  )[0];
  const n0 = sigPatternsWithMasks.filter(
    (spwm) => spwm.pattern.length === 6 && spwm.mask !== n6.mask && spwm.mask !== n9.mask
  )[0];

  // return { 0: n0, 1: n1, 2: n2, 3: n3, 4: n4, 5: n5, 6: n6, 7: n7, 8: n8, 9: n9 };
  const result: {
    [key: string]: Numeral;
  } = {};

  [n0, n1, n2, n3, n4, n5, n6, n7, n8, n9].forEach((n, i) => {
    result[n.pattern] = i as Numeral;
  });

  return result;
}

function patternToMask(pattern: string): number {
  return pattern.split('').reduce((prev, cur) => {
    return prev | segmentsToMasks[cur as SEGMENT];
  }, 0);
}

function maskToPattern(mask: number): string {
  return Object.keys(masksToSegments).reduce((res, masksToSegmentKey) => {
    if ((parseInt(masksToSegmentKey) & mask) !== 0) {
      return res + masksToSegments[masksToSegmentKey as unknown as SEGMENT_MASK];
    }
    return res;
  }, '');
}

function getMaskPadded(mask: number) {
  const str = mask.toString(2);
  if (str.length < 7) {
    const pad = '0'.repeat(7 - str.length);
    return pad + str;
  }
  return str;
}

function part2Solution(entries: Entry[]) {
  const entriesWithSortedSignals: Entry[] = entries.map((entry) => ({
    sigPatterns: entry.sigPatterns.map((s) => s.split('').sort().join('')),
    output: entry.output.map((s) => s.split('').sort().join('')),
  }));
  // we need them sorted in case we don't get result as wire mappings - char => segment
  // but we get result as pattern => numeral

  // console.log(entries);
  // console.log('=======');
  // console.log(entriesWithSortedSignals);

  let totalOutputSum = 0;
  for (let entry of entriesWithSortedSignals) {
    const mappedPatternToNumeral = solvePatterns(entry.sigPatterns);
    const ouptutNumeralString = entry.output.reduce((resultNumeralOutput, curOutputPattern) => {
      return resultNumeralOutput + mappedPatternToNumeral[curOutputPattern];
    }, '');
    // console.log('ouptutNumeralString: ', ouptutNumeralString);
    totalOutputSum += parseInt(ouptutNumeralString);
  }

  return totalOutputSum;
}

const entries = parseInput();
console.log('part1Solution: ', part1Solution(entries));

console.log('part2Solution: ', part2Solution(entries));
