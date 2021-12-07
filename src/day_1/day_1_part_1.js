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
    // output: process.stdout,
    // terminal: false,
  });

  let previous = null;
  let current;
  let totalIncreased = 0;
  for await (const line of rl) {
    current = parseInt(line);
    // console.log("current: ", current);
    if (previous !== null && current > previous) {
      totalIncreased++;
    }
    previous = current;
  }
  console.log('Total increased: ', totalIncreased);
}

processLineByLine();
