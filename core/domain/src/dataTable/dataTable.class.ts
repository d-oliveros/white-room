import type { z } from 'zod';
import type { DataSource, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import type { DataTableId } from './dataTable.enums';
import type {
  DataTableFuzzySearchParams,
  DataTableQueryParams,
  DataTableQueryResult,
  DataTableItemSchema,
} from './dataTable.schemas';

export interface DataTableConstructor {
  new (dataSource: DataSource): DataTable<DataTableItemSchema>;
}

export abstract class DataTable<TSchema extends DataTableItemSchema> {
  protected readonly DEFAULT_COUNT = 12;
  protected readonly MAX_COUNT = 100;

  static readonly id: DataTableId;

  get id(): DataTableId {
    return (this.constructor as typeof DataTable).id;
  }

  abstract readonly schema: TSchema;
  abstract query(): SelectQueryBuilder<ObjectLiteral>;

  protected createQueryBuilder: DataSource['createQueryBuilder'];

  constructor(dataSource: DataSource) {
    this.createQueryBuilder = dataSource.createQueryBuilder.bind(dataSource);
  }

  async loadItems(
    params: DataTableQueryParams = {},
  ): Promise<DataTableQueryResult<z.infer<TSchema>>> {
    this.validateParams(params);

    let query = this.query();

    // Apply filters
    query = this.applyFilters(query, params.filter);
    query = this.applyFuzzySearch(query, params.fuzzy);

    // Optionally prepare items count query
    const countQuery = params.includeItemsCount
      ? this.createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from(`(${query.getQuery()})`, 't')
          .setParameters(query.getParameters())
      : null;

    // Apply sort, limit, pagination
    query = this.applySorting(query, params.sort);
    query = query.limit(Math.min(Math.max(params.count ?? this.DEFAULT_COUNT, 1), this.MAX_COUNT));

    if (params.skip) {
      query = query.offset(params.skip);
    }

    // Execute query and validate results
    const [rawResults, countResult] = await Promise.all([
      query.getRawMany(),
      countQuery ? countQuery.getRawOne() : null,
    ]);

    const items = rawResults.map((result) => this.schema.parse(result));

    const result: DataTableQueryResult<z.infer<TSchema>> = { items };

    // Set total count if requested
    if (params.includeItemsCount) {
      result.totalCount = Number(countResult?.count ?? 0);
    }

    return result;
  }

  private validateSchemaKey(key: string): boolean {
    return key in this.schema.shape;
  }

  private validateParams(params: DataTableQueryParams): void {
    // Validate sort fields
    if (params.sort) {
      params.sort.forEach(({ field }) => {
        if (!this.validateSchemaKey(field)) {
          throw new Error(
            `Invalid sort field: "${field}". Must be one of: ${Object.keys(this.schema.shape).join(', ')}`,
          );
        }
      });
    }

    // Validate filter fields
    if (params.filter) {
      Object.keys(params.filter).forEach((key) => {
        if (!this.validateSchemaKey(key)) {
          throw new Error(
            `Invalid filter field: "${key}". Must be one of: ${Object.keys(this.schema.shape).join(', ')}`,
          );
        }
      });
    }

    // Validate fuzzy search fields
    if (params.fuzzy) {
      params.fuzzy.forEach((fuzzy) => {
        fuzzy.columns.forEach((column) => {
          if (!this.validateSchemaKey(column)) {
            throw new Error(
              `Invalid fuzzy search field: "${column}". Must be one of: ${Object.keys(this.schema.shape).join(', ')}`,
            );
          }
        });
      });
    }
  }

  private applyFilters(
    query: SelectQueryBuilder<ObjectLiteral>,
    filter?: Record<string, unknown>,
  ): SelectQueryBuilder<ObjectLiteral> {
    if (!filter) return query;

    Object.entries(filter).forEach(([key, value]) => {
      const quotedKey = key
        .split('.')
        .map((s) => `"${s}"`)
        .join('.');

      if (Array.isArray(value)) {
        query.andWhere(`${quotedKey} IN (:...${key})`, { [key]: value });
      } else {
        query.andWhere(`${quotedKey} = :${key}`, { [key]: value });
      }
    });

    return query;
  }

  private applySorting(
    query: SelectQueryBuilder<ObjectLiteral>,
    sort?: Array<{ field: string; direction: 'ASC' | 'DESC' }>,
  ): SelectQueryBuilder<ObjectLiteral> {
    if (!sort?.length) return query;

    sort.forEach(({ field, direction }) => {
      const sortDbField = field
        .split('.')
        .map((s) => `"${s}"`)
        .join('.');
      query.addOrderBy(`${sortDbField}`, direction, 'NULLS LAST');
    });

    return query;
  }

  private applyFuzzySearch(
    query: SelectQueryBuilder<ObjectLiteral>,
    fuzzySearches?: DataTableFuzzySearchParams[],
  ): SelectQueryBuilder<ObjectLiteral> {
    if (!fuzzySearches?.length) return query;

    fuzzySearches.forEach((fuzzy, index) => {
      if (!fuzzy.queryString || !fuzzy.columns?.length) return;

      const conditions = fuzzy.columns.map((column) => {
        if (column.includes('.')) {
          const tableNames = column.split('.');
          const selector = tableNames.reduce((acc, tableName, index) => {
            if (index === 0) return `"${tableName}"`;
            if (index === tableNames.length - 1) return `${acc} ->> '${tableName}'`;
            return `${acc} -> '${tableName}'`;
          }, '');
          return `${selector} ILIKE :searchTerm${index}`;
        }
        return `"${column}" ILIKE :searchTerm${index}`;
      });

      query.andWhere(`(${conditions.join(' OR ')})`, {
        [`searchTerm${index}`]: `%${fuzzy.queryString}%`,
      });
    });

    return query;
  }
}
