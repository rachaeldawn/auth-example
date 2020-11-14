import os from 'os';
import { Environment } from '@app/constants';
import { getEnvVar } from './utilities/environment';

export class AppEnvironment {

  public pgUrl: string;
  public useFork: boolean;
  public forkCount: number;
  public port: number;

  constructor() {
    const processLimit = !!process.env.FORK_COUNT
      ? parseInt(process.env.FORK_COUNT)
      : os.cpus().length;

    const forkMatch = /(y|yes|true)/i;
    const fork = (getEnvVar(Environment.fork) || 'TRUE').toLowerCase();

    this.useFork = forkMatch.test(fork);
    this.forkCount = this.useFork ? processLimit : 0; 
    this.pgUrl = getEnvVar(Environment.pgUrl);
  }
}
