const dotenv = require('dotenv');
const { existsSync } = require('fs');

if (existsSync('./.env')) dotenv.config();

module.exports = {
  "moduleFileExtensions": ["js", "json", "ts"],
  "moduleNameMapper": {
    "@app(.*)": "<rootDir>/../src$1.ts",
    "@test(.*)": "<rootDir>/../test$1"
  },
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  }
}
