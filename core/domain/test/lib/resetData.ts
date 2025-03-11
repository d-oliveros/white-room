import type { DataSource } from 'typeorm';

/**
 * Resets all data in the database by truncating all tables
 * Temporarily disables triggers during the operation
 */
export async function resetData(dataSource: DataSource, tables?: string[]): Promise<void> {
  const tablesToTruncate =
    tables || dataSource.entityMetadatas.map((meta) => `"${meta.tableName}"`);

  // Disable triggers
  await dataSource.query('SET session_replication_role = replica;');

  try {
    for (const table of tablesToTruncate) {
      try {
        await dataSource.query(`TRUNCATE TABLE ${table} CASCADE;`);
      } catch {
        continue;
      }
    }
  } finally {
    // Re-enable triggers
    await dataSource.query('SET session_replication_role = DEFAULT;');
  }
}
