// tslint:disable
import 'module-alias/register';
import 'reflect-metadata';

import dotenv from 'dotenv';

import os from 'os';
import cluster from 'cluster';

import { existsSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupDefaultApp } from './app';

if (existsSync('./.env')) dotenv.config();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: '*', preflightContinue: false },
  });
  setupDefaultApp(app);
  const port: number = !!process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);
}

async function initialize(): Promise<void> {
  const clusterMatch = /(y|yes|true)/i;
  const useCluster = clusterMatch.exec(process.env.USE_FORK ?? 'TRUE') != null;
  const processLimit = !!process.env.FORK_COUNT
    ? parseInt(process.env.FORK_COUNT)
    : os.cpus().length;

  const forkCount = isNaN(processLimit)
    ? os.cpus().length
    : processLimit;

  if (useCluster && cluster.isMaster) {
    console.info(`Starting server with #${forkCount} forks`);

    // for every core, start an instance
    for (let i = 0; i < forkCount; ++i) cluster.fork();

    // when one dies, bring it back up
    cluster.on('exit', worker => {
      console.log(`Worker with pid ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    bootstrap();
  }

}

initialize();

// tslint:enable
