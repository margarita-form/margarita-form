const invalidValues = ['', null, undefined, NaN, Infinity] as unknown[];

export const valueIsDefined = (value: unknown) => {
  try {
    if (invalidValues.includes(value)) return false;
    if (value instanceof Promise) return true;
    if (value instanceof RegExp) return true;
    if (value && typeof value === 'object') {
      try {
        return Object.values(value).length > 0;
      } catch (error) {
        return true;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const isObject = (value: unknown): boolean => {
  const validValue = valueIsDefined(value);
  if (!validValue) return false;
  return typeof value === 'object';
};

export const isIncluded = (value: unknown, array: unknown[]): boolean => {
  return array.some((item) => isEqual(item, value));
};

export const isEqual = (value: unknown, other: unknown, log = false): boolean => {
  try {
    if (typeof value === 'object') {
      return JSON.stringify(value) === JSON.stringify(other);
    }
    return value === other;
  } catch (error) {
    if (log) console.warn('Could not compare values!', { value, other, error });
    return false;
  }
};
