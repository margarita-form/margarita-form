import { MargaritaFormResolver, ResolverOutput } from '../typings/core-types';

type ResolverValue<O> = MargaritaFormResolver<O> | ResolverOutput<O>;

export class Resolver<O> {
  constructor(public value: ResolverValue<O>, public snapshotValue?: O) {}
  static create<O>(value: ResolverValue<O>, snapshotValue?: O): Resolver<O> {
    return new Resolver(value, snapshotValue);
  }
}
