export function transpose<T>(matrix: T[][]): T[][] {
  const colCount = matrix[0].length || 0;
  const rowCount = matrix.length;
  const res: T[][] = [];
  for (let j = 0; j < colCount; j++) {
    res[j] = Array(rowCount);
  }

  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j < colCount; j++) {
      res[j][i] = matrix[i][j];
    }
  }

  return res;
}

export function rotate90Right<T>(matrix: T[][]): T[][] {
  return transpose(matrix).map((row) => row.reverse());
}

export function rotate180Right<T>(matrix: T[][]): T[][] {
  return matrix
    .slice()
    .reverse()
    .map((r) => r.slice().reverse());
}

export function rotate270Right<T>(matrix: T[][]): T[][] {
  return transpose(matrix).reverse();
}

export function mirrorHorizontal<T>(matrix: T[][]): T[][] {
  const colCount = matrix[0].length || 0;
  const rowCount = matrix.length;
  const res: T[][] = [];
  for (let i = 0; i < rowCount; i++) {
    res[i] = Array(colCount);
  }
  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j < colCount; j++) {
      res[i][colCount - 1 - j] = matrix[i][j];
    }
  }
  return res;
}

export function stringifyMatrix<T>(matrix: T[][], colSeparator: string = ','): string {
  return matrix.reduce(
    (prev, cur, index) => prev + cur.join(colSeparator) + (index === matrix.length - 1 ? '' : '\n'),
    ''
  );
}
