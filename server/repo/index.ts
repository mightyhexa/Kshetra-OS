import { IRepository } from './types';
import { JsonFileRepository } from './jsonRepo';
import { SqliteRepository } from './sqliteRepo';
import { config } from '../config';

export function createRepository(): IRepository {
  if (config.dbType === 'json') {
    return new JsonFileRepository();
  }
  return new SqliteRepository();
}

export const repository: IRepository = createRepository();

export * from './types';
export * from './seed';
