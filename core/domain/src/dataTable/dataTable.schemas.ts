import { z } from 'zod';

export const DataTableFuzzySearchParamsSchema = z.object({
  queryString: z.string(),
  columns: z.array(z.string()),
});

export const DataTableQueryParamsSchema = z.object({
  count: z.number().optional(),
  skip: z.number().optional(),
  sort: z
    .array(
      z.object({
        field: z.string(),
        direction: z.enum(['ASC', 'DESC']),
      }),
    )
    .optional(),
  filter: z.record(z.unknown()).optional(),
  fuzzy: z.array(DataTableFuzzySearchParamsSchema).optional(),
  includeItemsCount: z.boolean().optional(),
});

export type DataTableFuzzySearchParams = z.infer<typeof DataTableFuzzySearchParamsSchema>;
export type DataTableQueryParams = z.infer<typeof DataTableQueryParamsSchema>;

export const DataTableQueryResultSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    totalCount: z.number().optional(),
  });

export type DataTableQueryResult<T> = z.infer<
  ReturnType<typeof DataTableQueryResultSchema<z.ZodType<T>>>
>;

export type DataTableItemSchema = z.ZodObject<Record<string, z.ZodType>>;
