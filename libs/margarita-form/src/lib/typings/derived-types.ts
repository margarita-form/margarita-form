import { ExtensionBase } from '../extensions/base/extension-base';
import { Extensions } from './expandable-types';

export type ExtensionInstanceLike = InstanceType<typeof ExtensionBase>;

export type ExtensionName = keyof Extensions;
export type ExtensionInstances = ExtensionInstanceLike[];
export type ExtensionsArray = Extensions[ExtensionName][];
