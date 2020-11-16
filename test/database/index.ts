import { getEnvVar } from '@test/utilities/environment';
import { Environment } from '@app/constants';
import { createConnection, Connection, EntityTarget, Repository } from 'typeorm';
import { RegisteredModels, Model } from './models';
import { DatabaseProvider } from './provider';

type Provider = {
  new (db: Database): DatabaseProvider<any>;
}

export class Database {

  private conn: Connection;
  private models: RegisteredModels;

  private providers: Map<string, DatabaseProvider<any>>;

  constructor(... providers: Provider[]) {
    this.models = new RegisteredModels();

    this.providers = new Map<string, DatabaseProvider<any>>();

    for (const provider of providers) {
      const name: string = provider.prototype?.name ?? (provider as any).name;
      if (!name) {
        throw new Error('Provider was given that was not a class');
      }

      this.providers.set(name, new provider(this))

      const models: Model[] | undefined = Reflect.get(provider, '__models');

      if (!models || !models.length) continue;
      this.models.add(models);
    }
  }

  public async connect(name?: string): Promise<void> {
    const url = getEnvVar(Environment.pgUrl);
    this.conn = await createConnection({
      type: 'postgres',
      url,
      entities: this.models.entities,
      name: name ?? `${Date.now()}-E2E-Connection`
    });
  }

  public async destroy(): Promise<void> {
    await this.conn.close();
  }

  public repo<T>(model: EntityTarget<T>): Repository<T> {
    return this.conn.getRepository(model);
  }

  public getProvider<T extends DatabaseProvider<any>>(arg: Provider): T {
    const name = arg.prototype.name ?? arg.name;
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error('Unregistered provider: ' + name);
    }

    return provider as T;
  }
}
