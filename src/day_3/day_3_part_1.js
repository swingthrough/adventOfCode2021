/**
 * Day 3: Binary Diagnostic, part 1
 *
 *
 * the task is ambiguous about what to do if there is the same number
 * of 0s as there is 1s in the corresponding position, therefore no
 * 'most common bit' present, however the task data does not have such
 * occurence so we can ignore it
 */

const fs = require('fs');
const readline = require('readline');
const yargs = require('yargs');

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

async function processLineByLine() {
  const rl = readline.createInterface({
    input: fs.createReadStream(args.inputFile),
  });

  let totals = null;

  for await (const line of rl) {
    const split = line.split('');

    if (totals === null) {
      totals = split.map((c) => (c === '0' ? -1 : 1));
    } else {
      split.forEach((c, i) => {
        totals[i] += c === '0' ? -1 : 1;
      });
    }
  }

  console.log('totals: ', totals);
  const gammaRateBinary = totals.map((n) => (n < 0 ? '0' : '1')).join('');
  const epsilonRateBinary = totals.map((n) => (n < 0 ? '1' : '0')).join('');
  console.log('gammaRateBinary:\t', gammaRateBinary);
  console.log('epsilonRateBinary:\t', epsilonRateBinary);

  const gammaRateDecimal = parseInt(gammaRateBinary, 2);
  const epsilonRateDecimal = parseInt(epsilonRateBinary, 2);
  console.log('gammaRateDecimal:\t', gammaRateDecimal);
  console.log('epsilonRateDecimal:\t', epsilonRateDecimal);

  console.log('gammaRateDecimal * epsilonRateDecimal: ', gammaRateDecimal * epsilonRateDecimal);
}

processLineByLine();
