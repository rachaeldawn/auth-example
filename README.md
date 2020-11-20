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

## Auth Keys
If you are just looking to run locally, you can run `npm run gen:keys` to generate a public/private key pair for signing auth tokens.
If you are looking to use your own keys, provide `AUTH_KEY_ALGO=algorithm`, `AUTH_PUBLIC_KEY=path` and `AUTH_PRIVATE_KEY=path`
  where `AUTH_KEY_ALGO` is one of [these](https://tools.ietf.org/html/rfc7518#section-3.1)
  where `AUTH_PUBLIC_KEY` is a path to the public key file
  where `AUTH_PRIVATE_KEY` is a path to the private key file
