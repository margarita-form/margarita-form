/* eslint-disable @typescript-eslint/no-unused-vars */
import { UnloadExtension } from './unload-extension';

declare module '@margarita-form/core' {
  export interface Extensions {
    unload: UnloadExtension;
  }
}
