import type { DataSourceManager } from '@domain/lib/DataSourceManager';
import { useDataSource as configureSeedingDataSource } from '@jorgebodega/typeorm-seeding';

import { DomainModule } from '@domain/domain.module';
import { createPostgresDataSourceManager } from '@domain/lib/DataSourceManager';
import { MockEventBus } from '@domain/test/lib/MockEventBus';
import * as entityFactories from '../factories';
import * as seeders from '../seeds';
import { resetData } from './resetData';

/**
 * A utility class that provides test infrastructure and helpers.
 *
 * Handles database lifecycle management, provides access to domain modules,
 * and includes factories and seeders for test data generation.
 *
 * @example
 * ```ts
 * const testService = new TestService();
 *
 * beforeAll(async () => {
 *   await testService.initDataSource();
 *   await testService.resetData();
 * });
 *
 * afterAll(async () => {
 *   await testService.destroyDataSource();
 * });
 *
 * test('example test', async () => {
 *   const {
 *     domain: { address },
 *     factories: { addressFactory },
 *   } = testService;
 *
 *   const address = await addressFactory.create();
 *   expect(address.addressService.getById(address.id)).resolves.toBeDefined();
 * });
 * ```
 */
export class TestService {
  public readonly domain: DomainModule;
  public readonly seeders: typeof seeders;
  public readonly factories: EntityFactoryInstances;

  private readonly dataSourceManager: DataSourceManager;

  constructor({ context }: { context: 'domain' | 'api' }) {
    this.dataSourceManager = createPostgresDataSourceManager({
      database: context === 'domain' ? 'namespace_test_domain' : 'namespace_test_api',
    });

    this.domain = new DomainModule(this.dataSourceManager.getDataSource(), new MockEventBus());

    this.seeders = seeders;
    this.factories = Object.entries(entityFactories).reduce<Record<string, unknown>>(
      (acc, [key, EntityFactoryClass]) => ({
        ...acc,
        [key[0].toLowerCase() + key.slice(1)]: new EntityFactoryClass(
          this.dataSourceManager.getDataSource(),
        ),
      }),
      {},
    ) as EntityFactoryInstances;
  }

  public async initDataSource() {
    await this.dataSourceManager.initialize();
    // Configure the data source used by the typeorm-seeding package
    configureSeedingDataSource(this.dataSourceManager.getDataSource());
  }

  public get dataSource() {
    return this.dataSourceManager.getDataSource();
  }

  public async destroyDataSource() {
    await this.dataSourceManager.destroyDataSource();
  }

  public async resetData(tables?: string[]) {
    await resetData(this.dataSourceManager.getDataSource(), tables);
  }
}

type EntityFactoryInstances = {
  [K in keyof typeof entityFactories as Uncapitalize<K>]: InstanceType<(typeof entityFactories)[K]>;
};
