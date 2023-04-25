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
