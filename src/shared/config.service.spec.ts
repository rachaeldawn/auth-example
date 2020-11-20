import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { CONFIG } from './constants';
import { v4 as uuid } from 'uuid';

describe('ConfigService', () => {
  let service: ConfigService;
  let conf: any;

  beforeEach(async () => {

    conf = { WORKS: uuid() };

    const module: TestingModule = await Test
      .createTestingModule({
        providers: [
          { provide: CONFIG, useValue: conf },
          ConfigService,
        ],
      })
      .compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get the proper value of a key', () => {
    const val = service.get('WORKS');
    expect(val).toEqual(conf.WORKS);
  });

  it('should get a null if not found', () => {
    const val = service.get('DOESNOTWORK');
    expect(val).toEqual(null);
  });
});
