import { EntitySchema } from 'typeorm';

export type Model = string | Function | EntitySchema<any>;

export class RegisteredModels {

  public entities: Model[] = [];

  public add(mods: Model | Model[]): void {
    const additions = Array.isArray(mods) ? mods : [ mods ];
    this.entities.push(... additions);
  }

  public clear(): void {
    this.entities = [];
  }
}
