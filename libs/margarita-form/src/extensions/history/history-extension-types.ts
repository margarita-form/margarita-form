/* eslint-disable @typescript-eslint/no-unused-vars */
import { HistoryExtension } from './history-extension';

declare module '../../typings/expandable-types' {
  export interface Extensions {
    history: HistoryExtension;
  }
}
