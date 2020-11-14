import { Module } from '@nestjs/common';
import { CONFIG } from './constants';
import { ConfigService } from './config.service';

@Module({
  providers: [
    { provide: CONFIG, useValue: process.env },
    ConfigService,
  ],
  exports: [ ConfigService ],
})
export class SharedModule {}
