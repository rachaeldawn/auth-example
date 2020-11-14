import * as Knex from 'knex';

const genUUID = (k: Knex) => k.raw('uuid_generate_v4()');
const genToken = (k: Knex) => k.raw('md5(uuid_generate_v4()::text)::varchar(32)')

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `CREATE EXTENSION IF NOT EXISTS citext;`
    + `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    + `CREATE SCHEMA auth;`
    + `CREATE SCHEMA accounts;`
  );

  await knex.schema
    .withSchema('auth')
    .createTable('users', tbl => {
      tbl.uuid('id')
        .primary()
        .defaultTo(genUUID(knex));

      tbl.specificType('email', 'citext')
        .notNullable()
        .unique();

      tbl.timestamp('created_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      tbl.timestamp('updated_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      tbl.timestamp('confirmed_at')
        .nullable();

      tbl.specificType('password', 'varchar(60)')
        .nullable();
    });

  await knex.schema
    .withSchema('auth')
    .createTable('refresh_tokens', tbl => {
      tbl.uuid('id')
        .primary()
        .defaultTo(genUUID(knex));

      tbl.timestamp('used_at').nullable();

      tbl.uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('auth.users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      tbl.timestamp('expires_at').notNullable();
    });

  await knex.schema
    .withSchema('auth')
    .createTable('password_resets', tbl => {
      tbl.uuid('id').primary().defaultTo(genUUID(knex));

      tbl.timestamp('created_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      tbl.timestamp('accepted_at')
        .notNullable();

      tbl.specificType('token', 'varchar(32)')
        .notNullable()
        .unique()
        .defaultTo(genToken(knex));

      tbl.uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('auth.users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    });

  await knex.schema
    .withSchema('auth')
    .createTable('account_confirmations', tbl => {
      tbl.uuid('id').primary().defaultTo(genUUID(knex));

      tbl.timestamp('created_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      tbl.timestamp('confirmed_at')
        .nullable();

      tbl.specificType('token', 'varchar(32)')
        .notNullable()
        .unique()
        .defaultTo(genToken(knex));

      tbl.specificType('email', 'citext')
        .notNullable();

      tbl.uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('auth.users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    });

  await knex.schema
    .withSchema('auth')
    .createTable('email_changes', tbl => {
      tbl.uuid('id').primary().defaultTo(genUUID(knex));

      tbl.timestamp('created_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      tbl.timestamp('confirmed_at')
        .nullable();

      tbl.specificType('token', 'varchar(32)')
        .notNullable()
        .unique()
        .defaultTo(genToken(knex));

      tbl.uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('auth.users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      tbl.specificType('old_email', 'citext')
        .notNullable();

      tbl.specificType('new_email', 'citext')
        .notNullable();
    });

  await knex.raw(`
    CREATE TYPE accounts.roles AS ENUM ('owner', 'user', 'guest')
  `);

  await knex.schema
    .withSchema('accounts')
    .createTable('organizations', tbl => {
      tbl.uuid('id').primary().defaultTo(genUUID(knex));

      tbl.specificType('name', 'varchar(256)')
        .notNullable()
        .defaultTo('');

      tbl.uuid('creator_id')
        .notNullable()
        .references('id')
        .inTable('auth.users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    });

  await knex.schema
    .withSchema('accounts')
    .createTable('users', tbl => {
      tbl.uuid('user_id')
        .primary()
        .references('id')
        .inTable('auth.users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      tbl.uuid('org_id')
        .notNullable()
        .references('id')
        .inTable('accounts.organizations')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      tbl.timestamp('created_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      tbl.timestamp('updated_at')
        .notNullable()
        .defaultTo(knex.fn.now());

      tbl.specificType('role', 'accounts.roles')
        .notNullable()
        .defaultTo('user');
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP SCHEMA auth CASCADE;
    DROP SCHEMA accounts CASCADE;
  `);
}
