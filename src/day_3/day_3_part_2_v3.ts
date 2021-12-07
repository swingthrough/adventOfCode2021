/**
 * Day 3: Binary Diagnostic, part 2
 * version 3 - use buckets and recursion
 *
 */
import * as fs from 'fs';
import * as readline from 'readline';
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

async function run() {
  const rl = readline.createInterface({
    input: fs.createReadStream(`${__dirname}/${args.inputFile}`),
  });

  const lines = [];

  for await (const line of rl) {
    lines.push(line);
    // console.log(split.map((c) => parseInt(c)));
  }

  const stringLength = lines[0].length;

  const oxygenGeneratorBinary = findRate(lines, 0, stringLength, 'oxygenGenerator');
  const co2ScrubberBinary = findRate(lines, 0, stringLength, 'co2Scrubber');

  console.log('oxygenGeneratorBinary: ', oxygenGeneratorBinary);
  console.log('co2ScrubberBinary: ', co2ScrubberBinary);

  const oxygenGeneratorDecimal = parseInt(oxygenGeneratorBinary, 2);
  const co2ScrubberDecimal = parseInt(co2ScrubberBinary, 2);

  console.log('oxygenGeneratorDecimal: ', oxygenGeneratorDecimal);
  console.log('co2ScrubberDecimal: ', co2ScrubberDecimal);
  console.log('oxygenGeneratorDecimal * co2ScrubberDecimal: ', oxygenGeneratorDecimal * co2ScrubberDecimal);
}

run();

function findRate(
  input: string[],
  analyzedCharIndex: number,
  stringLength: number,
  rateType: 'oxygenGenerator' | 'co2Scrubber'
): string {
  if (input.length === 0) {
    throw new Error('input array does not have any elements');
  }
  if (input.length === 1) {
    return input[0];
  }
  if (analyzedCharIndex >= stringLength) {
    // this is also to avoid continuing if there are duplicated elements
    // in the input that are the only ones left, so previous condition
    // does not catch it, and it would just continue infinitely
    return input[0];
  }
  // More checks would be necessary to make this robust, e.g. to compare analyzedCharIndex
  // with the actual input[i] size, not the passed stringLength... but let's assume
  // that the input is consistent, which for this task it is

  const { bucketZeros, bucketOnes } = bucketizeBasedOnIndex(input, analyzedCharIndex);

  if (rateType === 'oxygenGenerator') {
    if (bucketOnes.length >= bucketZeros.length) {
      return findRate(bucketOnes, analyzedCharIndex + 1, stringLength, rateType);
    } else {
      return findRate(bucketZeros, analyzedCharIndex + 1, stringLength, rateType);
    }
  } else if (rateType === 'co2Scrubber') {
    if (bucketZeros.length <= bucketOnes.length) {
      return findRate(bucketZeros, analyzedCharIndex + 1, stringLength, rateType);
    } else {
      return findRate(bucketOnes, analyzedCharIndex + 1, stringLength, rateType);
    }
  } else {
    throw new Error(`Unknown rateType '${rateType}'`);
  }

  /**
   * Condition can be simplified to the following part,
   * less verbose but feels less expressive about the intention,
   *
   *
   * maybe there's an even better way than these two?? TODO, or... TOTHINK
   */
  // if (bucketOnes.length >= bucketZeros.length) {
  //   return findRate(
  //     rateType === 'oxygenGenerator' ? bucketOnes : bucketZeros,
  //     analyzedCharIndex + 1,
  //     stringLength,
  //     rateType
  //   );
  // } else {
  //   return findRate(
  //     rateType === 'oxygenGenerator' ? bucketZeros : bucketOnes,
  //     analyzedCharIndex + 1,
  //     stringLength,
  //     rateType
  //   );
  // }
}

function bucketizeBasedOnIndex(startingBucket: string[], charIndex: number) {
  const bucketZeros: string[] = [];
  const bucketOnes: string[] = [];
  startingBucket.forEach((el) => {
    if (charIndex >= el.length) {
      throw new Error(`charIndex '${charIndex}' out of range of analyzed string '${el}'`);
    }
    const c = el.charAt(charIndex);

    if (c === '0') {
      bucketZeros.push(el);
    } else if (c === '1') {
      bucketOnes.push(el);
    } else {
      throw new Error(`Invalid character encountered: '${c}'`);
    }
  });

  return { bucketZeros, bucketOnes };
}
