/* eslint-disable @typescript-eslint/no-unused-vars */
import { MFF } from '../../typings/margarita-form-types';
import { HistoryEntry, HistoryExtension } from './history-extension';

declare module '@margarita-form/core' {
  export interface Extensions {
    history: HistoryExtension;
  }

  export interface ControlBase<FIELD extends MFF> {
    get history(): HistoryEntry[];
    undo: () => void;
    redo: () => void;
  }
}
