import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '@app/app.module';
import { setupDefaultApp } from '@app/app';
import { INestApplication } from '@nestjs/common';
import { Database } from '@test/database';

const moduleName = ''
const serviceName = ''

describe(`${moduleName}Module -- ${serviceName}Service`, () => {
  const testName = `${moduleName}#${serviceName}`;
  let app: INestApplication;
  let database: Database;

  beforeAll(async () => {
    database = new Database();
    await database.connect(testName);
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test
      .createTestingModule({ imports: [AppModule] })
      .compile();

    app = moduleFixture.createNestApplication();
    setupDefaultApp(app);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await database.disconnect();
  });

  it('#test - Initializes Properly', () => {
    expect(database).toBeDefined();
  });
});

