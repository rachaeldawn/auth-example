import { getEnvVar } from '@test/utilities/environment';
import { Environment } from '@app/constants';
import { createConnection, Connection, EntityTarget, Repository } from 'typeorm';
import { ModelContainer, Model } from './models';
import { DatabaseProvider } from './provider';

type ProviderCtor<T = any> = {
  new (db: Database): DatabaseProvider<T>;
}

/**
 * Used as the DB IO "root". Register providers when creating a new Database object, and
 * use said Providers as a way to expose TypeOrm functionality to your tests.
 */
export class Database {

  private conn: Connection;
  private models: ModelContainer;

  private providers: Map<string, DatabaseProvider<any>>;

  constructor(... providers: ProviderCtor[]) {
    this.models = new ModelContainer();
    this.providers = new Map<string, DatabaseProvider<any>>();

    providers.forEach(a => this.addProvider(a));
  }

  /**
   * Call this to connect to the db, and finalize the init of all models.
   */
  public async connect(name?: string): Promise<void> {
    const url = getEnvVar(Environment.pgUrl);
    this.conn = await createConnection({
      type: 'postgres',
      url,
      entities: this.models.entities,
      name: name ?? `${Date.now()}-E2E-Connection`,
    });
  }

  /**
   * Disconnect Typeorm from the database
   */
  public async disconnect(): Promise<void> {
    await this.conn.close();
  }

  /**
   * Just get a repository for a model that is _assumed_ to be registered.
   */
  public repo<T>(model: EntityTarget<T>): Repository<T> {
    return this.conn.getRepository(model);
  }

  /**
   * Register and create a new provider for your testing
   */
  public addProvider<T extends DatabaseProvider<any>>(provider: ProviderCtor): T {
    const name: string = provider.prototype?.name ?? (provider as any).name;
    if (!name) {
      throw new Error('Provider was given that was not a class');
    }

    const models: Model[] = this.getProviderModels(provider);
    if (models.length > 0) this.models.add(models);

    const instance = new provider(this) as T;
    this.providers.set(name, instance)

    return instance;
  }

  /**
   * Remove an already created provider from the database setup, including any models
   * that were also registered under it
   */
  public removeProvider<T extends DatabaseProvider<any>>(provider: ProviderCtor<T>) {
    const name = provider.prototype.name ?? provider.name;
    if (!name) {
      throw new Error('No name to reference for removing provider');
    }

    if (!this.providers.has(name)) return

    const models = this.getProviderModels(provider);
    if (models.length > 0) this.models.remove(models);
  }

  /**
   * Retrieve a provider that was initialized under this Database instance
   */
  public getProvider<T extends DatabaseProvider<any>>(arg: ProviderCtor): T {
    const name = arg.prototype.name ?? arg.name;
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error('Unregistered provider: ' + name);
    }

    return provider as T;
  }

  /**
   * Manually register a model for usage (not recommended, create a new provider)
   */
  public addModel(mod: Model | Model[]): void {
    this.models.add(mod);
  }

  /**
   * Manually unregister a model from test usage
   */
  public removeModel(mod: Model | Model[]): void {
    this.models.remove(mod);
  }

  private getProviderModels(prov: ProviderCtor): Model[] {
    return Reflect.get(prov, '__models') ?? [];
  }
}
