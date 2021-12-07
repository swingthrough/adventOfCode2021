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
    input: fs.createReadStream(`${__dirname}/${args.inputFile}`),
    // output: process.stdout,
    // terminal: false,
  });

  let totalHorizontal = 0;
  let totalDepth = 0;
  let aim = 0;
  for await (const line of rl) {
    const [command, stepsString] = line.split(' ');
    const steps = parseInt(stepsString);
    if (command === 'forward') {
      totalHorizontal += steps;
      totalDepth += steps * aim;
    } else if (command === 'up') {
      aim -= steps;
    } else if (command === 'down') {
      aim += steps;
    }
  }
  console.log('final aim: ', aim);
  console.log('totalHorizontal: ', totalHorizontal);
  console.log('totalDepth: ', totalDepth);
  console.log('totalHorizontal * totalDepth: ', totalHorizontal * totalDepth);
}

processLineByLine();
