import {
  transpose,
  rotate90Right,
  rotate180Right,
  rotate270Right,
  stringifyMatrix,
  mirrorHorizontal,
} from './matrixUtils';

const testMatrix = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
];

console.log('testMatrix: ');
console.log(stringifyMatrix(testMatrix));

const mirroredHorizontally = mirrorHorizontal(testMatrix);
console.log('mirroredHorizontally:');
console.log(stringifyMatrix(mirroredHorizontally));

console.log('testMatrix: ');
console.log(stringifyMatrix(testMatrix));
console.log('-----');

const transposed = transpose(testMatrix);
console.log('transposed:');
console.log(stringifyMatrix(transposed));

console.log('testMatrix: ');
console.log(stringifyMatrix(testMatrix));
console.log('-----');

const rotated90Right = rotate90Right(testMatrix);
console.log('rotated90Right:');
console.log(stringifyMatrix(rotated90Right));

console.log('testMatrix: ');
console.log(stringifyMatrix(testMatrix));
console.log('-----');

const rotated180Right = rotate180Right(testMatrix);
console.log('rotated180Right:');
console.log(stringifyMatrix(rotated180Right));

console.log('testMatrix: ');
console.log(stringifyMatrix(testMatrix));
console.log('-----');

const rotated270Right = rotate270Right(testMatrix);
console.log('rotated270Right:');
console.log(stringifyMatrix(rotated270Right));

console.log('testMatrix: ');
console.log(stringifyMatrix(testMatrix));
console.log('-----');

// TODO: test transformations on [[]] for completeness -> identity
