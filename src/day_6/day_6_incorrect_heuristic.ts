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

function parseInput() {
  const liner = new nreadlines(args.inputFile);

  let line = liner.next();
  if (!line) {
    console.log('Input is empty!');
    return;
  }
  if (liner.next() !== false) {
    liner.close();
  }
  return line
    .toString()
    .split(',')
    .map((c) => parseInt(c));
}
/**
 * Fish produces every 7 days, resets it's timer to 6 (0 is valid timer number)
 * Newly produced fish has timer set to 8 (will create another 6 and 8 after 9 days)
 *
 * every fish therefore "produces self" as 6 and new fish as 8
 * this creates a binary tree
 * we can notice that each layer in the binary tree has equal number of 6s and 8s
 *
 * therefore we can split it into two trees - tree of 6s and tree of 8s
 *  - but split only after the original first fish has already made it's first production
 *    of a single 6 and single 8 --- and then we can make calculations
 *
 * !!!!!!!!!!
 * !!!!!!!!!!
 * !!!!!!!!!!
 * CAUTION ---- INCORRECT ^^
 *  - this would only work if fish 6 always spawned new fish 6 and fish 8 always
 * spawned fish 8 but that's not the case with this task
 * !!!!!!!!!!
 * !!!!!!!!!!
 * !!!!!!!!!!
 *
 * @param fishTimer
 * @param days
 * @returns
 */
function singleFishProduction(fishTimer: number, days: number) {
  console.log(`fishTimer: ${fishTimer}, days: ${days}`);
  if (days <= fishTimer) {
    // only self remains - the one original fish -> return 1 - "produced itself only"
    // also e.g. if fishTimer === 1 & days === 1, it doesn't produce new fish yet
    // only on next day it would do so
    console.log('<return 1>');
    return 1;
  }
  // here: days > fishTimer
  const daysLeftAfterFirstBirth = days - fishTimer - 1;
  console.log('daysLeftAfterFirstBirth:', daysLeftAfterFirstBirth);
  if (daysLeftAfterFirstBirth <= 6) {
    // on next day it produces itself with timer "6" and new fish with "8"
    // but no more days left so we can return
    console.log('<return 2>');
    return 2;
  }
  // more days to go and now we have two fish, one "6" - original reset, one "8" - fresh born
  //  - now we can make calculations for each of these parts
  // here: daysLeftAfterFirstBirth > 0

  // // fish "6"
  // // init as "self producing", therefore 1
  // let fish6Production = 1;

  const fish6exponent = Math.floor(daysLeftAfterFirstBirth / 7);
  console.log('fish6exponent: ', fish6exponent);
  const fish6Production = 2 ** fish6exponent;
  console.log('fish6Production: ', fish6Production);

  const fish8exponent = Math.floor(daysLeftAfterFirstBirth / 9);
  console.log('fish8exponent: ', fish8exponent);
  const fish8Production = 2 ** fish8exponent;
  console.log('fish8Production: ', fish8Production);
  console.log('fish6Production + fish8Production', fish6Production + fish8Production);

  return fish6Production + fish8Production;
}

function part1Solution(days: number, fishTimers: number[]) {
  console.log(fishTimers);
  if (fishTimers) {
    const fishProductions = fishTimers.map((ft) => {
      console.log('-------------');
      const r = singleFishProduction(ft, days);
      console.log('-------------');
      return r;
    });
    console.log(`fishProductions after ${days} days: `, fishProductions);
    const total = fishProductions.reduce((total, cur) => total + cur);
    console.log(`total after ${days} days: ${total}`);
    return total;
  }
}

function parseTestSimulation() {
  const liner = new nreadlines('test_simulation.txt');

  let line = liner.next(); // get rid of first line "initial state"

  const res: {
    [key: number]: {
      after: number;
      totalFish: number;
    };
  } = {};
  let day = 1;
  while ((line = liner.next())) {
    const out = line.toString().split(':')[1].trim().split(',').length;
    res[day] = {
      after: day,
      totalFish: out,
    };
    day++;
  }

  return res;
}

const simRes = parseTestSimulation();
// console.log(simRes);

const fishTimers = parseInput();
if (!fishTimers) {
  console.log('No fishTimers were parsed');
  process.exit(1);
}

for (let i = 10; i < 19; i++) {
  console.log(`Calculate after [  ${i}  ] days`);
  part1Solution(i, fishTimers);
  console.log(`simulation after ${i} days: ${simRes[i].totalFish}`);
  console.log('==================================');
}

// console.log('-------');
// console.log(singleFishProduction(6, 5));
// console.log('-------');
// console.log(singleFishProduction(5, 5));
// console.log('-------');
// console.log(singleFishProduction(4, 5));
// console.log('-------');
// console.log(singleFishProduction(3, 5));
// console.log('-------');
// console.log(singleFishProduction(2, 7));
// console.log('-------');
// console.log(singleFishProduction(1, 7));

// console.log('-------');
// console.log('prod: ', singleFishProduction(0, 7));
// console.log('-------');
// console.log('prod: ', singleFishProduction(0, 8));
// console.log('-------');
// console.log('prod: ', singleFishProduction(0, 9));
// console.log('-------');
// console.log('prod: ', singleFishProduction(0, 14));
// console.log('-------');
// console.log('prod: ', singleFishProduction(0, 15));
// console.log('-------');
// console.log('prod: ', singleFishProduction(1, 19));
// console.log('-------');
// console.log('prod: ', singleFishProduction(0, 19));
// console.log('-------');
// console.log('prod: ', singleFishProduction(2, 24));
// console.log('-------');
