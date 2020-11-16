import { FindConditions } from 'typeorm';

/** Common type used for erasing items from the database */
export type Erasure<T> = string | string[] | T | FindConditions<T> 
