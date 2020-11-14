import Knex from 'knex';

import { getEnvVar } from './environment';
import { Environment } from '@app/constants';

export function getKnexClient(): Knex {
  const connection = getEnvVar(Environment.pgUrl);
  return Knex({
    client: 'pg',
    pool: { min: 0, max: 5 },
    connection,
  });
}

export function getTable<T = any>(table: string, kn?: Knex): Knex.QueryBuilder<T> {
  const client = kn ?? getKnexClient();
  return client.queryBuilder().table(table);
}
