/* eslint-disable @typescript-eslint/no-unused-vars */
import { UnloadExtension } from './unload-extension';

declare module '../../typings/expandable-types' {
  export interface Extensions {
    unload: UnloadExtension;
  }
}
