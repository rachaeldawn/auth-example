## Description

A NestJS Rest API with basic Auth as an example for developers to study, and potentially as a seed project for those looking to make their own fully-fledged NestJS API

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Environment Variables

| Variable | Usage | Description |
| :------- | :---- | :---------- |
| FORK_COUNT | How many sub-process forks are created, default = cpu count | Fork for production clustering |
| USE_FORK | booleans | Whether or not to use the the cluster feature | 
| PG_URL | a Postgres URI | Example: `postgres://user:password@host:port/db_name` |
| USE_SSL | boolean | Whether or not to append `ssl=true` to the PG_URL |

## Code Samples


