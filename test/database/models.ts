import { EntitySchema } from 'typeorm';

/** The basic required type for a Model to work with TypeOrm */
export type Model = string | Function | EntitySchema<any>;

/**
 * An easy wrapper for storing entity references for a Database instance
 */
export class ModelContainer {

  public entities: Model[] = [];

  /**
   * Add one or many models to be used when a connection is made
   */
  public add(mods: Model | Model[]): void {
    const additions = Array.isArray(mods) ? mods : [ mods ];
    this.entities.push(... additions);
  }

  /**
   * Remove one or many models from the container
   */
  public remove(mod: Model | Model[]): void {
    const arr = Array.isArray(mod) ? mod : [ mod ];
    this.entities = this.entities.filter(a => !arr.includes(a));
  }

  /**
   * Completely clear out the entities
   */
  public clear(): void {
    this.entities = [];
  }
}
