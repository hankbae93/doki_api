import { EntityManager, QueryRunner } from 'typeorm';

export class ConnectionMock {
  qr = {
    manager: {} as EntityManager,
    connect() {},
    startTransaction() {},
    commitTransaction() {},
    rollbackTransaction() {},
    release() {},
  } as QueryRunner;

  createQueryRunner(mode?: 'master' | 'slave'): QueryRunner {
    return this.qr;
  }
}
