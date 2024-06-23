export const generateId = (prefix: string): string =>
  `${prefix}` +
  Math.random().toString(36).substring(2, 10).toUpperCase() +
  Date.now()
    .toString()
    .substring(Date.now().toString().length / 2);
