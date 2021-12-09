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

interface PosFreq {
  position: number;
  frequency: number;
}

function getValFreqsSortedByValAsc(input: number[]): PosFreq[] {
  if (input.length === 0) {
    return [];
  }

  const frequencies = new Map<number, number>();

  input.forEach((n) => {
    if (frequencies.has(n)) {
      frequencies.set(n, frequencies.get(n)! + 1);
    } else {
      frequencies.set(n, 1);
    }
  });
  // console.log(frequencies);

  // sort descending
  const freqenciesSortedAsc: PosFreq[] = [...frequencies.entries()]
    .sort((a, b) => a[0] - b[0])
    .map((vf) => ({
      position: vf[0],
      frequency: vf[1],
    }));
  return freqenciesSortedAsc;
}

const rangeBetweenIncl = (start: number, end: number) => {
  const [s, e] = end >= start ? [start, end] : [end, start];
  const length = e - s + 1;
  return Array.from({ length }, (_, i) => s + i);
};

interface FuelForAlignPosition {
  fuel: number;
  alignPosition: number;
}

function part1Solution(input: number[]) {
  const valFreqsSortedAsc = getValFreqsSortedByValAsc(input);
  // console.log(input);
  // console.log(valFreqsSortedAsc);

  const range = rangeBetweenIncl(
    valFreqsSortedAsc[0].position,
    valFreqsSortedAsc[valFreqsSortedAsc.length - 1].position
  );

  const fuelForAlignPositions: FuelForAlignPosition[] = range.map((alignPosition) => {
    const fuel = valFreqsSortedAsc
      .map((vfq) => Math.abs(vfq.position - alignPosition) * vfq.frequency)
      .reduce((t, v) => t + v);

    return {
      fuel,
      alignPosition,
    };
  });

  // console.log(fuelForAlignPositions);

  let minFuel = Infinity;
  let forAlignPosition;
  fuelForAlignPositions.forEach((ps) => {
    if (ps.fuel < minFuel) {
      minFuel = ps.fuel;
      forAlignPosition = ps.alignPosition;
    }
  });

  return {
    minFuel,
    forAlignPosition,
  };
}

function part2Solution(input: number[]) {
  const valFreqsSortedAsc = getValFreqsSortedByValAsc(input);
  // console.log(input);
  // console.log(valFreqsSortedAsc);

  const range = rangeBetweenIncl(
    valFreqsSortedAsc[0].position,
    valFreqsSortedAsc[valFreqsSortedAsc.length - 1].position
  );

  const fuelForAlignPositions: FuelForAlignPosition[] = range.map((alignPosition) => {
    const fuel = valFreqsSortedAsc
      .map((vfq) => {
        const steps = Math.abs(vfq.position - alignPosition);
        // arithmetic series sum - n/2*(first + last)
        const fuelForOneCrab = (steps / 2) * (1 + steps);
        // multiply by frequency to get total fuel by each crab at this position
        return fuelForOneCrab * vfq.frequency;
      })
      .reduce((t, v) => t + v);

    return {
      fuel,
      alignPosition,
    };
  });

  // console.log(fuelForAlignPositions);

  let minFuel = Infinity;
  let forAlignPosition;
  fuelForAlignPositions.forEach((ps) => {
    if (ps.fuel < minFuel) {
      minFuel = ps.fuel;
      forAlignPosition = ps.alignPosition;
    }
  });

  return {
    minFuel,
    forAlignPosition,
  };
}

const input = parseInput();
if (!input) {
  console.log('No input was parsed');
  process.exit(1);
}

const sol1 = part1Solution(input);
console.log('sol1: ', sol1);
const sol2 = part2Solution(input);
console.log('sol2: ', sol2);
