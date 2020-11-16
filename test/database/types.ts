import { FindConditions } from 'typeorm';

export type Erasure<T> = string | string[] | T | FindConditions<T> 
