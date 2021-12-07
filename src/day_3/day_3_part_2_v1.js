/**
 * Day 3: Binary Diagnostic, part 2
 *
 * first sort lines lexicographically and then
 * use subarrays via slice()
 *
 * slice() creates shallow copy of an array,
 * but that's only relevant with object references
 * and in case we're modifying the objects
 *
 * here we only have string arrays so it actually
 * copies the values, as strings are primitive values in JS
 *
 * and we are not even trying to modify those strings anyway
 * so this rant is kinda irrelevant
 *
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

async function run() {
  const rl = readline.createInterface({
    input: fs.createReadStream(`${__dirname}/${args.inputFile}`),
  });

  const lines = [];

  for await (const line of rl) {
    lines.push(line);
    // console.log(split.map((c) => parseInt(c)));
  }
  const sortedLines = lines.sort();
  // sortedLines.forEach((l) => console.log(l));
  const stringLength = sortedLines[0].length;

  let subArray = sortedLines;
  for (let i = 0; i < stringLength; i++) {
    const idxOfFirst1 = subArray.findIndex((l) => l.charAt(i) === '1');
    // console.log('idxOfFirst1: ', idxOfFirst1);
    if (subArray.length - idxOfFirst1 >= idxOfFirst1) {
      subArray = subArray.slice(idxOfFirst1);
    } else {
      subArray = subArray.slice(0, idxOfFirst1);
    }
    // console.log(`[i=${i}] subArrayShallowCp: `);
    // subArrayShallowCp.forEach((l) => console.log(l));
    if (subArray.length === 1) {
      break;
    }
    // console.log('----');
  }
  console.log('final subArrayShallowCp (oxygen generator rating): ', subArray);
  const oxygenGeneratorBinary = subArray[0];
  console.log('===========');

  subArray = sortedLines;
  // subArrayShallowCp.forEach((l) => console.log(l));
  for (let i = 0; i < stringLength; i++) {
    const idxOfFirst1 = subArray.findIndex((l) => l.charAt(i) === '1');
    // console.log('idxOfFirst1: ', idxOfFirst1);
    if (subArray.length - idxOfFirst1 < idxOfFirst1) {
      subArray = subArray.slice(idxOfFirst1);
    } else {
      subArray = subArray.slice(0, idxOfFirst1);
    }
    // console.log(`[i=${i}] subArrayShallowCp: `);
    // subArrayShallowCp.forEach((l) => console.log(l));
    if (subArray.length === 1) {
      break;
    }
    // console.log('----');
  }
  console.log('final subArrayShallowCp (CO2 scrubber rating): ', subArray);
  const co2ScrubberBinary = subArray[0];
  console.log('===========');

  const oxygenGeneratorDecimal = parseInt(oxygenGeneratorBinary, 2);
  const co2ScrubberDecimal = parseInt(co2ScrubberBinary, 2);

  console.log('oxygenGeneratorDecimal: ', oxygenGeneratorDecimal);
  console.log('co2ScrubberDecimal: ', co2ScrubberDecimal);
  console.log(
    'oxygenGeneratorDecimal * co2ScrubberDecimal: ',
    oxygenGeneratorDecimal * co2ScrubberDecimal
  );
}

run();
