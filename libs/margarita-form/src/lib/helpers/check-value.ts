const invalidValues = ['', null, undefined, NaN] as unknown[];

export const valueExists = (value: unknown) => {
  try {
    if (invalidValues.includes(value)) return false;
    if (value && typeof value === 'object') {
      return Object.values(value).length > 0;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const isIncluded = (value: unknown, array: unknown[]): boolean => {
  return array.some((item) => isEqual(item, value));
};

export const isEqual = (value: unknown, other: unknown): boolean => {
  try {
    if (typeof value === 'object') {
      return JSON.stringify(value) === JSON.stringify(other);
    }
    return value === other;
  } catch (error) {
    console.warn('Could not compare values!', { value, other, error });
    return false;
  }
};
