import type { z } from 'zod';
import type { DataSource } from 'typeorm';
import type { DataTableId } from './dataTable.enums';
import type { DataTable, DataTableConstructor } from './dataTable.class';
import type {
  DataTableQueryParams,
  DataTableItemSchema,
  DataTableQueryResult,
} from './dataTable.schemas';

import * as DataTables from './tables';

export class DataTableService {
  private dataTables = new Map<DataTableId, DataTable<DataTableItemSchema>>();

  constructor(dataSource: DataSource) {
    Object.values(DataTables).forEach((DataTableClass) => {
      if (typeof DataTableClass === 'function' && 'id' in DataTableClass) {
        this.dataTables.set(DataTableClass.id, new DataTableClass(dataSource));
      }
    });
  }

  getDataTable<T extends DataTableId>(dataTableId: T): DataTable<DataTableItemSchema> {
    const dataTable = this.dataTables.get(dataTableId);
    if (!dataTable) {
      throw new Error(
        `DataTable "${dataTableId}" not found. Available datatables: ${[...this.dataTables.keys()].join(', ')}`,
      );
    }
    return dataTable;
  }

  getDataTableList(): DataTable<DataTableItemSchema>[] {
    const dataTables = Array.from(this.dataTables.values());
    dataTables.sort((a, b) => (a.id > b.id ? 1 : -1));
    return dataTables;
  }

  async loadItems<T extends DataTableId>(
    dataTableId: T,
    params: DataTableQueryParams = {},
  ): Promise<DataTableQueryResult<SchemaType<DataTableMap[T]>>> {
    const dataTable = this.getDataTable(dataTableId);
    return dataTable.loadItems(params) as Promise<
      DataTableQueryResult<SchemaType<DataTableMap[T]>>
    >;
  }
}

type DataTablesType = typeof DataTables;

type DataTableClasses = {
  [K in keyof DataTablesType]: DataTablesType[K] extends DataTableConstructor
    ? DataTablesType[K]
    : never;
}[keyof DataTablesType];

// Create type mapping from DataTableId to table instances
type DataTableMap = {
  [K in DataTableClasses as K['id']]: InstanceType<K>;
};

// Type helper to get the schema type from a DataTable class
type SchemaType<T> = T extends DataTable<infer S> ? z.infer<S> : never;
