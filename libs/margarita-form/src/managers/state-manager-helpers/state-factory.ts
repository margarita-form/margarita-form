import { MFC, Tail } from '../../light';
import { StateManager } from '../state-manager';
import { BooleanPairState, DerivedState, GeneralState } from './state-classes';

type StateConstructor = typeof GeneralState | typeof BooleanPairState | typeof DerivedState;

export const createState =
  <C extends StateConstructor>(type: C, ...rest: Tail<ConstructorParameters<C>>) =>
  (state: StateManager<MFC>) => {
    const constructor = type as unknown as new (...args: any[]) => InstanceType<C>;
    return new constructor(state, ...rest);
  };

export type StateFactoryFunction = ReturnType<typeof createState>;
