/**
 * Day 3: Binary Diagnostic, part 2
 *
 * this TypeScript file is only to test 'ts-node' speed when
 * executing a .ts file compared to executing .js file
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
    input: fs.createReadStream(args.inputFile),
  });

  const lines = [];

  for await (const line of rl) {
    lines.push(line);
    // console.log(split.map((c) => parseInt(c)));
  }
  const sortedLines = lines.sort();
  // sortedLines.forEach((l) => console.log(l));
  const stringLength = sortedLines[0].length;

  let subArrayShallowCp = sortedLines;
  for (let i = 0; i < stringLength; i++) {
    const idxOfFirst1 = subArrayShallowCp.findIndex((l) => l.charAt(i) === '1');
    // console.log('idxOfFirst1: ', idxOfFirst1);
    if (subArrayShallowCp.length - idxOfFirst1 >= idxOfFirst1) {
      subArrayShallowCp = subArrayShallowCp.slice(idxOfFirst1);
    } else {
      subArrayShallowCp = subArrayShallowCp.slice(0, idxOfFirst1);
    }
    // console.log(`[i=${i}] subArrayShallowCp: `);
    // subArrayShallowCp.forEach((l) => console.log(l));
    if (subArrayShallowCp.length === 1) {
      break;
    }
    // console.log('----');
  }
  console.log('final subArrayShallowCp (oxygen generator rating): ', subArrayShallowCp);
  const oxygenGeneratorBinary = subArrayShallowCp[0];
  console.log('===========');

  subArrayShallowCp = sortedLines;
  // subArrayShallowCp.forEach((l) => console.log(l));
  for (let i = 0; i < stringLength; i++) {
    const idxOfFirst1 = subArrayShallowCp.findIndex((l) => l.charAt(i) === '1');
    // console.log('idxOfFirst1: ', idxOfFirst1);
    if (subArrayShallowCp.length - idxOfFirst1 < idxOfFirst1) {
      subArrayShallowCp = subArrayShallowCp.slice(idxOfFirst1);
    } else {
      subArrayShallowCp = subArrayShallowCp.slice(0, idxOfFirst1);
    }
    // console.log(`[i=${i}] subArrayShallowCp: `);
    // subArrayShallowCp.forEach((l) => console.log(l));
    if (subArrayShallowCp.length === 1) {
      break;
    }
    // console.log('----');
  }
  console.log('final subArrayShallowCp (CO2 scrubber rating): ', subArrayShallowCp);
  const co2ScrubberBinary = subArrayShallowCp[0];
  console.log('===========');

  const oxygenGeneratorDecimal = parseInt(oxygenGeneratorBinary, 2);
  const co2ScrubberDecimal = parseInt(co2ScrubberBinary, 2);

  console.log('oxygenGeneratorDecimal: ', oxygenGeneratorDecimal);
  console.log('co2ScrubberDecimal: ', co2ScrubberDecimal);
  console.log('oxygenGeneratorDecimal * co2ScrubberDecimal: ', oxygenGeneratorDecimal * co2ScrubberDecimal);
}

run();
