/**
 * Day 3: Binary Diagnostic, part 2
 * version 2 - use ranges instead of array slice() on iterations
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

  let start = 0;
  let end = sortedLines.length;
  for (let i = 0; i < stringLength; i++) {
    let indexOfFirst1 = -1;
    for (let j = start; j < end; j++) {
      if (sortedLines.charAt(j) === '1') {
        indexOfFirst1 = j;
        break;
      }
      // todo;
    }
  }
}

run();
