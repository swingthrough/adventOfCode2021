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

const YOUNG_SPAWN_TIMER = 8;
const ADULT_RESET_TIMER = 6;

function simulateFish(days: number, fishTimers: number[]) {
  // console.log('initial timers: ', fishTimers);

  const fish = new Map<number, number>(rangeBetweenIncl(0, YOUNG_SPAWN_TIMER).map((n) => [n, 0]));

  fishTimers.forEach((ft) => {
    const ex = fish.get(ft);
    fish.set(ft, ex ? ex + 1 : 1);
  });

  // console.log('fish after init: ');
  // printFish(fish);

  for (let day = 1; day <= days; day++) {
    let fishGivingBirth = fish.get(0) as number; // cast as we initialized range (0,8) for adults
    for (let fishType = 1; fishType <= YOUNG_SPAWN_TIMER; fishType++) {
      const count = fish.get(fishType) as number;
      fish.set(fishType - 1, count);
    }
    fish.set(YOUNG_SPAWN_TIMER, fishGivingBirth); // set (8, val(previous 0))
    fish.set(ADULT_RESET_TIMER, (fish.get(ADULT_RESET_TIMER) as number) + fishGivingBirth);

    // console.log(`fish after day ${day}`);
    // printFish(fish);
  }
  let sum = 0;
  for (let val of fish.values()) {
    sum += val;
  }

  return sum;
}

function printFish(fish: Map<number, number>) {
  for (let [key, value] of fish.entries()) {
    // console.log(`(${key},${value})`);
    process.stdout.write(`(${key},[${value}]) `);
  }
  process.stdout.write(`\n`);
}

const rangeBetweenIncl = (start: number, end: number) => {
  const [s, e] = end >= start ? [start, end] : [end, start];
  const length = e - s + 1;
  return Array.from({ length }, (_, i) => s + i);
};

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

const fishTimers = parseInput();
if (!fishTimers) {
  console.log('No fishTimers were parsed');
  process.exit(1);
}

const part1days = 80;
const part2days = 256;
console.log(`Fish after ${part1days} days:`, simulateFish(part1days, fishTimers));
console.log(`Fish after ${part2days} days:`, simulateFish(part2days, fishTimers));

// const simRes = parseTestSimulation();
// // console.log(simRes);
// for (let i = 10; i < 19; i++) {
//   console.log(`Calculate after [  ${i}  ] days:`, simulateFish(i, fishTimers));
//   console.log(`simulation after ${i} days:`, simRes[i].totalFish);
//   console.log('==================================');
// }
