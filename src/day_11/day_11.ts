import nreadlines from 'n-readlines';
import * as yargs from 'yargs';

import * as util from 'util';

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

  const energyLevels: number[][] = [];

  let line;
  while ((line = liner.next())) {
    energyLevels.push(
      line
        .toString()
        .split('')
        .map((c) => parseInt(c))
    );
  }

  return energyLevels;
}

interface Position {
  row: number;
  col: number;
}

const RELATIVE_NEIGHBORS: Position[] = [
  { row: -1, col: 0 }, // top
  { row: 1, col: 0 }, // bottom
  { row: 0, col: -1 }, // left
  { row: 0, col: 1 }, // right
  { row: -1, col: -1 }, // top left
  { row: -1, col: 1 }, // top right
  { row: 1, col: -1 }, // bottom left
  { row: 1, col: 1 }, // bottom right
];

function getNeighbors(row: number, col: number, rowCount: number, colCount: number): Position[] {
  return RELATIVE_NEIGHBORS.map<Position>((rn) => ({
    row: row + rn.row,
    col: col + rn.col,
  })).filter((n) => n.row >= 0 && n.row < rowCount && n.col >= 0 && n.col < colCount); // filter out invalid ones (out of bounds of 2d array)
}

class Octopus {
  private energy: number;
  private frozen: boolean = false;

  constructor(energy: number) {
    this.energy = energy;
  }

  getEnergy() {
    return this.energy;
  }

  increaseEnergy() {
    this.energy++;
  }

  freeze() {
    this.frozen = true;
  }

  isFrozen() {
    return this.frozen;
  }

  isReadyToFlash() {
    return this.energy > 9;
  }

  // /**
  //  * TODO(2): from OOP perspective - should we check if is ready to flash inside of here?
  //  * what if flash is called on octopus that is not ready to flash?
  //  * should it really reset energy?
  //  * maybe flash is a bad name for this, we probably just need reset()
  //  * flash() could be meaningful if octopus was actually aware of it's neighbors
  //  * then flash() could call flash() on it's neighbors and the recursive part that
  //  * is currently handled in the OctopusField class would be handled here
  //  *
  //  * but then again - if we decided not to use recursion but a stack, that would
  //  * bump up the responsibility for dealing with the stack back up to the OctopusField
  //  * - but maybe OctopusField could still ask Octopus for it's neighbors to flash them?
  //  */
  // flash() {
  //   this.energy = 0;
  //   this.frozen = false;
  // }

  reset() {
    this.energy = 0;
    this.frozen = false;
  }
}

class OctopusField {
  private octopusesField: Octopus[][];
  private flashesAfterSteps: number[] = [];
  private stepCount: number = 0;

  private synchronizedAtStep: number | null = null;

  constructor(energyLevels: number[][]) {
    this.octopusesField = energyLevels.map((rowOfEnergies) =>
      rowOfEnergies.map((energy) => new Octopus(energy))
    );
  }

  step() {
    this.octopusesField.forEach((row, rowIdx) =>
      row.forEach((_, colIdx) => {
        this.__recursiveIncrease(rowIdx, colIdx);
      })
    );

    let flashes = 0;

    this.octopusesField.forEach((row) =>
      row.forEach((octopus) => {
        if (octopus.isReadyToFlash()) {
          flashes++;
          octopus.reset();
        }
      })
    );
    this.flashesAfterSteps.push(flashes);
    this.stepCount++;

    if (this.__isSynchronized() && this.synchronizedAtStep === null) {
      this.synchronizedAtStep = this.stepCount;
    }
  }

  runUntilSynchronized() {
    if (this.synchronizedAtStep !== null) {
      throw new Error(`Field was already synchronized at step ${this.synchronizedAtStep}`);
    }

    do {
      this.step();
    } while (this.synchronizedAtStep === null);
  }

  getStepCount() {
    return this.stepCount;
  }

  getSynchronizedAtStep() {
    return this.synchronizedAtStep;
  }

  private __isSynchronized(): boolean {
    for (let row of this.octopusesField) {
      for (let octopus of row) {
        if (octopus.getEnergy() !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  steps(numOfSteps: number) {
    for (let i = 0; i < numOfSteps; i++) {
      this.step();
    }
  }

  /**
   * TODO(1): potential refactor - each octopus could have a reference to its neighbors
   * then we would just need to pass octopus to this function
   * but that would mean that we need to initialize these neighbor connections in the constructor
   * we would not even need 'octopusField: Octopus[][]' just 'octopuses: Octopus[]'
   * but using the 2d array field is easier when debugging and printing the field to the console
   *
   * Maybe for printing the filed we could just make each octopus aware of its position,
   * keep internal values of rowCount and colCount (so we don't have to filter these max values from octopus positions each time)
   *  - but IMHO that doesn't feel right from OOP perspecitive, octopus is not really the one who should be aware of it's position,
   *    that's a responsibility of the encompassing field, but I think it could still be beneficial for octopus to know it's neighbors.
   *  - keeping position both in field and in octopus would introduce double source of truth...
   *    but maybe it's okay? If we only change it through a field method, that changes both its own and octopus's value
   *      - but still... what would octopus position mean without it's encompassing field? Octopus object would have a redundant property
   *  - I guess this also depends on whether Octopus could potentially change positions in the field,
   *    - there could be a Map<Position, Octopus> but then why not just keep the 2d array
   *    - or for some usecase we could make use of Map<Octopus, Position>? But still the position is the way to find the octopus, not the
   *      other way around, and keeping both of these would again be a double source of truth - if we needed to work with a single octopus
   *      and still be aware of it's position, we can work with row, col values and always get the octopus from the 2d array
   *
   *
   * We could also keep the 2d array, and still make Octopus aware of its neighbors as stated above
   * and that as well would allow to pass only the octopus, but let's just stick with the 2d field for now
   *
   *
   * @param row
   * @param col
   */
  private __recursiveIncrease(row: number, col: number) {
    const octopus = this.octopusesField[row][col];
    octopus.increaseEnergy();
    if (octopus.isReadyToFlash() && !octopus.isFrozen()) {
      // freeze before going to neighbors so we don't end up in an infinite loop
      // where its neighbor would call this one as neighbor and so on and so on
      octopus.freeze();
      // console.log(`readyToFlash: (${row}, ${col}) - energy: ${this.octopusesField[row][col].getEnergy()}`);
      const neighborPositions = getNeighbors(
        row,
        col,
        this.octopusesField.length,
        this.octopusesField[0].length
      );
      neighborPositions.forEach((nPos) => this.__recursiveIncrease(nPos.row, nPos.col));
    }
  }

  printField() {
    // const arr = this.octopusesField.map((row) => row.map((col) => col.energy));
    // console.log(util.inspect(arr, { colors: true, compact: true }));
    this.octopusesField.forEach((row) => {
      console.log(row.map((col) => col.getEnergy()).join(''));
    });
  }

  getTotalFlashes() {
    return this.flashesAfterSteps.reduce((total, n) => total + n);
  }
}

//
// ======== SOLUTIONS: ========
//

const input = parseInput();

const octopusField = new OctopusField(input);
// octopusField.printField();
console.log('---------');
octopusField.steps(100);
// octopusField.printField();
console.log('part 1 solution:', octopusField.getTotalFlashes());
console.log('---------');
console.log('part 2 solution: ');
// octopusField.steps(1000);
octopusField.runUntilSynchronized();
console.log('current step count: ', octopusField.getStepCount());
console.log('synced at step: ', octopusField.getSynchronizedAtStep());
