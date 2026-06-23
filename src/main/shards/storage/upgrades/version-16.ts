import { QueryRunner, Table, TableIndex } from 'typeorm'

/**
 * Version 16 - 新增 QQAccounts 表（QQ 賬號管理 + 封禁查詢）
 */
export async function v16_LA1_3_8Upgrade(queryRunner: QueryRunner) {
  await queryRunner.createTable(
    new Table({
      name: 'QQAccounts',
      columns: [
        { name: 'id', type: 'varchar', isPrimary: true },
        { name: 'qq', type: 'varchar', isNullable: false },
        { name: 'area', type: 'varchar', isNullable: false },
        { name: 'gameId', type: 'varchar', isNullable: true },
        { name: 'tag', type: 'varchar', isNullable: true },
        { name: 'banStatus', type: 'varchar', isNullable: false, default: "''" },
        { name: 'banUntil', type: 'varchar', isNullable: true },
        { name: 'banRemaining', type: 'varchar', isNullable: true },
        { name: 'lastCheckedAt', type: 'datetime', isNullable: true },
        { name: 'createdAt', type: 'datetime', isNullable: false }
      ]
    })
  )

  await queryRunner.createIndex(
    'QQAccounts',
    new TableIndex({
      name: 'qq_accounts_qq_index',
      columnNames: ['qq']
    })
  )

  await queryRunner.query(`UPDATE Metadata SET value = json('16') WHERE key = 'version'`)
}
