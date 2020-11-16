import { Database } from '.';
import { Model } from './models';
import { Repository } from 'typeorm';
import { Erasure } from './types';

export interface IDatabaseModels {
  models: Model[];
}

export abstract class DatabaseProvider<T> {

  public abstract get repo(): Repository<T>;

  constructor(protected db: Database) { }

  public abstract async one(... args: any[]): Promise<T>;
  public abstract async many(... args: any[]): Promise<T[]>;
  public abstract async delete(arg: Erasure<T>): Promise<void>;
}

export function ProvideModels(... arg: Model[]) {
  return function (ctor: Function) {
    Reflect.set(ctor, '__models', arg);
  }
}
