export const cleanObject = <T extends Record<string, any>>(
  obj: T,
): Partial<T> => {
  const cleanedObj = { ...obj };
  Object.keys(cleanedObj).forEach((key) => {
    if (cleanedObj[key] === undefined) {
      delete cleanedObj[key];
    }
  });
  return cleanedObj;
};
