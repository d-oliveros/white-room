import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { DomainModule } from '@domain';
import type { DataTableQueryParams } from '@domain/dataTable/dataTable.schemas';

import { zodToJsonSchema } from '@namespace/shared';
import {
  DataTableQueryResultSchema,
  DataTableQueryParamsSchema,
} from '@domain/dataTable/dataTable.schemas';

export default function DataTableController(
  fastify: FastifyInstance,
  opts: { domain: DomainModule },
) {
  const dataTableList = opts.domain.dataTable.dataTableService.getDataTableList();

  for (const dataTable of dataTableList) {
    fastify.route({
      method: 'GET',
      url: `/datatables/${dataTable.id}`,
      schema: {
        response: {
          200: zodToJsonSchema(DataTableQueryResultSchema(dataTable.schema)),
        },
        querystring: zodToJsonSchema(DataTableQueryParamsSchema),
      },
      handler: async function (request: FastifyRequest<{ Querystring: DataTableQueryParams }>) {
        const params = request.query;
        return this.domain.dataTable.dataTableService.loadItems(dataTable.id, params);
      },
    });
  }
}
