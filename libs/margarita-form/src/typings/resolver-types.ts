// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Resolvers {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Validators {}

export type ValidatorNames = keyof Validators;

type ValidatorParam<T extends ValidatorNames> = Parameters<Validators[T]>[0]['params'];

export type Validation = {
  [K in ValidatorNames]: ValidatorParam<K>;
};
