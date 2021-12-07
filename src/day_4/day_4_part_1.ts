import * as fs from 'fs';
import * as readline from 'readline';
import * as yargs from 'yargs';

interface Field {
  num: number;
  marked: boolean;
}

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
    input: fs.createReadStream(args.inputFile),
  });

  let lineNumber = 1;

  let drawnNumbers: number[] = [];
  const boards: Field[][][] = [];
  let readingBoardIndex = -1;

  let currentBoard: Field[][] = [];

  for await (const line of rl) {
    if (lineNumber === 1) {
      drawnNumbers = line.split(',').map((c) => parseInt(c));
    } else if (line === '') {
      if (readingBoardIndex >= 0) {
        boards.push(currentBoard);
        currentBoard = [];
      }
      readingBoardIndex++;
    } else {
      currentBoard.push(
        line
          .trim()
          .replace(/\s+/g, ' ')
          .split(' ')
          .map((c) => ({
            num: parseInt(c),
            marked: false,
          }))
      );
      // console.log('currentBoard: ', currentBoard);
    }
    lineNumber++;
  }

  // add last read board - in case there is no more empty line for line === '' condition
  if (currentBoard.length > 0) {
    boards.push(currentBoard);
    currentBoard = [];
  }

  // console.log('boards:', printableBoards(boards));

  console.log('drawnNumbers: ', drawnNumbers);

  // TODO: remove this, just for test
  // drawnNumbers = [0, 15, 3, 2, 22];

  const playResult = play(boards, drawnNumbers);

  if (playResult.win === true) {
    const { winningBoard: wb, calledWinningNumber } = playResult;
    console.log('winning board: ', printableBoard(wb));
    const unmarkedNumsSum = wb.reduce(
      (totalSum, row) =>
        totalSum +
        row.reduce((colSum, el) => {
          return colSum + (el.marked ? 0 : el.num);
        }, 0),
      0
    );
    console.log('unmarkedNumsSum: ', unmarkedNumsSum);
    console.log('calledWinningNumber: ', calledWinningNumber);
    console.log('unmarkedNumsSum * calledWinningNumber: ', unmarkedNumsSum * calledWinningNumber);
    // wb[0].reduce((acc, el) => {return acc + el.num}, 0)
  } else {
    console.log('game ended with no winning board');
  }
}

type PlayResultType =
  | {
      win: true;
      winningBoard: Field[][];
      winningBoardIndex: number;
      calledWinningNumber: number;
    }
  | { win: false };

function play(boards: Field[][][], drawnNumbers: number[]): PlayResultType {
  for (let drawNumIdx = 0; drawNumIdx < drawnNumbers.length; drawNumIdx++) {
    for (let boardIdx = 0; boardIdx < boards.length; boardIdx++) {
      markNumberInBoard(boards[boardIdx], drawnNumbers[drawNumIdx]);
      const win = checkBoard(boards[boardIdx]);
      if (win) {
        return {
          win: true,
          winningBoard: boards[boardIdx],
          winningBoardIndex: boardIdx,
          calledWinningNumber: drawnNumbers[drawNumIdx],
        };
      }
    }
  }

  return { win: false };
}

function markNumberInBoard(board: Field[][], numberToMark: number) {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col].num === numberToMark) {
        board[row][col].marked = true;
      }
    }
  }
}

function checkBoard(board: Field[][]): boolean {
  const rowsCount = board.length;
  const colsCount = board[0].length;

  // check rows
  for (let row = 0; row < rowsCount; row++) {
    let isWinningRow = true;
    for (let col = 0; col < colsCount; col++) {
      if (board[row][col].marked === false) {
        isWinningRow = false;
        break;
      }
    }
    if (isWinningRow) {
      return true;
    }
  }

  // check cols
  for (let col = 0; col < colsCount; col++) {
    let isWinningCol = true;
    for (let row = 0; row < rowsCount; row++) {
      if (board[row][col].marked === false) {
        isWinningCol = false;
        break;
      }
    }
    if (isWinningCol) {
      return true;
    }
  }

  return false;
}

function printableBoards(boards: Field[][][]): string[][][] {
  return boards.map((b) => printableBoard(b));
}

function printableBoard(b: Field[][]): string[][] {
  return b.map((bRow) => bRow.map((el) => (el.marked ? `(${el.num})` : `${el.num}`)));
}

run();
