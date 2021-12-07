/**
 * If the following is used instead of 'import' format:
 *
 * const fs = require('fs');
 * const readline = require('readline');
 *
 * then that can lead to problems as TypeScript won't
 * recognize the file as a module and will think
 * it is part of a global execution environment.
 * So we would need to add at least an empty export statement:
 *
 * export {}
 *
 * to make TypeScript consider the file a module
 *
 * https://stackoverflow.com/a/50913569/4955762
 *
 * https://web.archive.org/web/20180609155906/http://fullstack-developer.academy/cannot-redeclare-block-scoped-variable-name/
 */
import * as fs from 'fs';
import * as readline from 'readline';
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

async function run() {
  const rl = readline.createInterface({
    input: fs.createReadStream(args.inputFile),
  });

  for await (const line of rl) {
    console.log(line);
  }
}

run();
