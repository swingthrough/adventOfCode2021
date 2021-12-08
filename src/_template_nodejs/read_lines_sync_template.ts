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

function run() {
  const liner = new nreadlines(args.inputFile);

  let line;
  if ((line = liner.next())) {
    console.log('line1: ', line.toString());
  }
  if ((line = liner.next())) {
    console.log('line2: ', line.toString());
  }

  let i = 0;
  while ((line = liner.next())) {
    console.log(`i=${i++}: `, line.toString('utf8'));
  }
}

run();
