require('reflect-metadata');

const dotenv = require('dotenv');
const { existsSync } = require('fs');

if (existsSync('./.env')) dotenv.config();

/**
 *
 *    'jose/jwe/compact/decrypt':
      '<rootDir>/node_modules/jose/dist/node/cjs/jwe/compact/decrypt.js',
 */

module.exports = {
  "moduleFileExtensions": ["js", "json", "ts"],
  "moduleNameMapper": {
    "@app(.*)": "<rootDir>/../src$1.ts",
    "@test(.*)": "<rootDir>/../test$1",
    // $1 := jwt/sign -> jwt/sign.js
    "jose(.*)": "<rootDir>/../node_modules/jose/dist/node/cjs/$1.js",
  },
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
