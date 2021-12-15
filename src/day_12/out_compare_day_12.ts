import nreadlines from 'n-readlines';
import * as yargs from 'yargs';

const args = yargs
  .option('mine', {
    alias: 'm',
    demand: true,
    type: 'string',
  })
  .option('correct', {
    alias: 'c',
    demand: true,
    type: 'string',
  })
  .check((a) => {
    if (!a.mine) {
      return '"mine" file cannot be an empty string!';
    }
    if (!a.correct) {
      return '"correct" file cannot be an empty string!';
    }
    return true;
  })
  .parseSync();

console.log('args.inputFile:', args.mine);
console.log('args.inputFile:', args.correct);
console.log('----');

function parseMine() {
  const liner = new nreadlines(args.mine);

  const lines1: string[] = [];

  let line;
  while ((line = liner.next())) {
    // lines.push(line.toString());
    lines1.push(line.toString());
  }

  return lines1;
}

function parseCorrect() {
  const liner = new nreadlines(args.correct);

  const lines2: string[] = [];

  let line;
  while ((line = liner.next())) {
    // lines.push(line.toString());
    lines2.push(line.toString());
  }

  return lines2;
}

const myLines = parseMine();
const correctLines = parseCorrect();

// myLines.sort();
// correctLines.sort();
const myLinesCorrect = myLines.filter((ml) => correctLines.includes(ml));
const myLinesRedundant = myLines.filter((ml) => !correctLines.includes(ml));

console.log('myLinesCorrect.length ', myLinesCorrect.length);
console.log('myLinesRedundant.length ', myLinesRedundant.length);

console.log('myLinesRdundant:');
console.log(myLinesRedundant);

// console.log(lines1);
// console.log(lines2);
