/**
 * SLIDING WINDOWS
 * 
  199  A      
  200  A B    
  208  A B C  
  210    B C D
  200  E   C D
  207  E F   D
  240  E F G  
  269    F G H
  260      G H
  263        H
 * 
 */

/**
 * In the above example, the sum of each three-measurement window is as follows:
 *  
  A: 607 (N/A - no previous sum)
  B: 618 (increased)
  C: 618 (no change)
  D: 617 (decreased)
  E: 647 (increased)
  F: 716 (increased)
  G: 769 (increased)
  H: 792 (increased)
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

async function processLineByLine() {
  const rl = readline.createInterface({
    input: fs.createReadStream(`${__dirname}/${args.inputFile}`),
  });

  let window1 = [];
  let window2 = [];
  let window3 = [];

  let lineNumber = 1;

  let totalIncreased = 0;
  for await (const line of rl) {
    let lineContent = parseInt(line);

    if (lineNumber % 3 === 0) {
      window1.push(lineContent);
      if (lineNumber > 3) {
        /**
         * The first time we get here is when lineNumber is 6,
         * due to the required condition above (lineNumber % 3 === 0)
         * combined with condition (lineNumber > 3)
         * so we can be sure window3 is full (3 elements) at this point
         *  - the first time window3 gets full is on lineNumber === 5
         */
        let w3sum = sum(window3);
        let w1sum = sum(window1);
        if (w1sum > w3sum) {
          totalIncreased++;
        }
      }
      window2.push(lineContent);
      window3 = [lineContent];
    } else if (lineNumber % 3 === 1) {
      if (lineNumber > 1) {
        /**
         * The first time we get here is when lineNumber is 4,
         * due to the required condition above (lineNumber % 3 === 1)
         * combined with condition (lineNumber > 1)
         * so we can be sure window1 is full (3 elements) at this point
         *  - the first time window1 gets full is on lineNumber === 3
         */
        window2.push(lineContent);
        window3.push(lineContent);
        let w1sum = sum(window1);
        let w2sum = sum(window2);
        if (w2sum > w1sum) {
          totalIncreased++;
        }
      }
      window1 = [lineContent];
    } else if (lineNumber % 3 === 2) {
      /**
       * we want window1 to get the new number also on line 2,
       * that's why it's outslide the condition (lineNumber > 2)
       * however, window3 gets it's first number on line 3
       * so we don't want to push anything to it sooner than that
       */
      window1.push(lineContent);
      if (lineNumber > 2) {
        /**
         * The first time we get here is when lineNumber is 5,
         * due to the required condition above (lineNumber % 3 === 2)
         * combined with condition (lineNumber > 2)
         * so we can be sure window1 is full (3 elements) at this point
         *  - the first time window3 gets full is on lineNumber === 5
         *
         * here we also want to start pushing to window3 within this code branch
         */
        window3.push(lineContent);
        let w2sum = sum(window2);
        let w3sum = sum(window3);
        if (w3sum > w2sum) {
          totalIncreased++;
        }
      }
      window2 = [lineContent];
    }

    lineNumber++;
  }
  console.log('Total increased: ', totalIncreased);
}

function sum(arr) {
  return arr.reduce((a, b) => a + b);
}

processLineByLine();
