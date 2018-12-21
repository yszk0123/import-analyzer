function debugForProduction(...args: any[]) {}

function debugForDevelopment(...args: any[]) {
  console.debug(...args);
}

export const debug =
  process.env.NODE_ENV === 'production'
    ? debugForProduction
    : debugForDevelopment;
