import { Injectable, Inject } from '@nestjs/common';
import { CONFIG } from './constants';

/**
 * Provides environment-variable config
 */
@Injectable()
export class ConfigService {

  /**
   * @param env The object to load into the service for use
   */
  constructor(@Inject(CONFIG) private readonly env: { [key: string]: string }) { }

  /**
   * Retrieve a value from the environment
   * @param key
   * @returns {string | null} The value of the config, or null if not found
   */
  public get(key: string): string | null {
    return key in this.env ? this.env[key] : null;
  }
}
