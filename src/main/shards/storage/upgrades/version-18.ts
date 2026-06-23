import { QueryRunner, TableColumn } from 'typeorm'

/**
 * Version 18 - QQAccounts 加 sortOrder 列（拖拽排序）
 */
export async function v18_LA1_3_8Upgrade(queryRunner: QueryRunner) {
  const table = await queryRunner.getTable('QQAccounts')
  if (table && !table.findColumnByName('sortOrder')) {
    await queryRunner.addColumn(
      table,
      new TableColumn({
        name: 'sortOrder',
        type: 'integer',
        isNullable: false,
        default: 0
      })
    )
    // 初始值按 createdAt 升序 rowid 賦值
    await queryRunner.query(
      `UPDATE QQAccounts SET sortOrder = (
         SELECT COUNT(*) FROM QQAccounts q2 WHERE q2.createdAt <= QQAccounts.createdAt
       )`
    )
  }
  await queryRunner.query(`UPDATE Metadata SET value = json('18') WHERE key = 'version'`)
}
