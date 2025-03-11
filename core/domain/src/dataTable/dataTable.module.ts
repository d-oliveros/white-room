import type { DataSource } from 'typeorm';
import { DataTableService } from './dataTable.service';

export class DataTableModule {
  public readonly dataTableService: DataTableService;

  constructor(dataSource: DataSource) {
    this.dataTableService = new DataTableService(dataSource);
  }
}
