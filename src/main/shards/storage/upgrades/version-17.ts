import { QueryRunner, TableColumn } from 'typeorm'

/**
 * Version 17 - QQAccounts 表加 rankInfo + rankCheckedAt 列
 */
export async function v17_QQRankUpgrade(queryRunner: QueryRunner) {
  const table = await queryRunner.getTable('QQAccounts')

  if (table) {
    if (!table.findColumnByName('rankInfo')) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: 'rankInfo',
          type: 'varchar',
          isNullable: true
        })
      )
    }
    if (!table.findColumnByName('rankCheckedAt')) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: 'rankCheckedAt',
          type: 'datetime',
          isNullable: true
        })
      )
    }
  }

  await queryRunner.query(`UPDATE Metadata SET value = json('17') WHERE key = 'version'`)
}
