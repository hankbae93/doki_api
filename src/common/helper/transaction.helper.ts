import { DataSource, EntityManager } from 'typeorm';

export class TransactionHelper {
  static async transaction(dataSource: DataSource, callback: (entityManager: EntityManager) => Promise<any>){
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const entityManager = queryRunner.manager;

    try {
      const result = await callback(entityManager);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new Error(err);
    } finally {
      await queryRunner.release();
    }
  }
}