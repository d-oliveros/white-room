import { DataTableId } from '@domain/dataTable/dataTable.enums';
import { UsersDataTable } from '@domain/dataTable/tables/users.dataTable';
import { TestService } from './lib/TestService';

describe('DataTables', () => {
  const testService = new TestService({ context: 'domain' });

  beforeAll(async () => {
    await testService.initDataSource();
    await testService.resetData();
  });

  afterAll(async () => {
    await testService.destroyDataSource();
  });

  describe('DataTable Class', () => {
    // TODO: Test invalid schema definitions: When results contain more fields than the schema, and when fields do not match the schema.
    const usersDataTable = new UsersDataTable(testService.dataSource);

    beforeEach(async () => {
      await testService.resetData();
    });

    afterAll(async () => {
      await testService.resetData();
    });

    test('loadItems', async () => {
      const result = await usersDataTable.loadItems();
      expect(result.items).toEqual([]);
      expect(result.totalCount).toBeUndefined();
    });

    test('includeItemsCount', async () => {
      const result1 = await usersDataTable.loadItems({
        includeItemsCount: true,
      });
      expect(result1.items).toEqual([]);
      expect(result1.totalCount).toBe(0);

      const user = await testService.factories.userFactory.create();
      const result2 = await usersDataTable.loadItems({
        includeItemsCount: true,
      });
      expect(result2.items).toHaveLength(1);
      expect(result2.items[0].id).toBe(user.id);
      expect(result2.items[0].firstName).toBe(user.firstName);
      expect(result2.totalCount).toBe(1);
    });

    test(`filters`, async () => {
      const users = await testService.factories.userFactory.createMany(3);

      // Should filter by single value
      const result1 = await usersDataTable.loadItems({
        filter: {
          id: users[0].id,
        },
        includeItemsCount: true,
      });
      expect(result1.items).toHaveLength(1);
      expect(result1.items[0].id).toBe(users[0].id);
      expect(result1.totalCount).toBe(1);

      // Should filter by multiple values
      const result2 = await usersDataTable.loadItems({
        filter: {
          id: [users[1].id, users[2].id],
        },
        includeItemsCount: true,
      });
      expect(result2.items).toHaveLength(2);
      expect(result2.items[0].id).toBe(users[1].id);
      expect(result2.items[1].id).toBe(users[2].id);
      expect(result2.totalCount).toBe(2);

      // Should not find any items
      const result3 = await usersDataTable.loadItems({
        filter: {
          firstName: 'notreallyaname',
        },
        includeItemsCount: true,
      });
      expect(result3.items).toHaveLength(0);
      expect(result3.totalCount).toBe(0);

      // Should filter by multiple values
      const result4 = await usersDataTable.loadItems({
        filter: {
          firstName: users[0].firstName,
          id: [users[0].id, users[1].id],
        },
        includeItemsCount: true,
      });
      expect(result4.items).toHaveLength(1);
      expect(result4.items[0].id).toBe(users[0].id);
      expect(result4.totalCount).toBe(1);
    });

    test('fuzzy search', async () => {
      // Should find a user by fuzzy first name
      const user = await testService.factories.userFactory.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
      });
      const result1 = await usersDataTable.loadItems({
        fuzzy: [
          {
            queryString: 'Te',
            columns: ['firstName', 'lastName'],
          },
        ],
        includeItemsCount: true,
      });
      expect(result1.items).toHaveLength(1);
      expect(result1.items[0].id).toBe(user.id);
      expect(result1.totalCount).toBe(1);

      // Should not find a user
      const result2 = await usersDataTable.loadItems({
        fuzzy: [
          {
            queryString: '@@@',
            columns: ['email'],
          },
        ],
        includeItemsCount: true,
      });
      expect(result2.items).toHaveLength(0);
      expect(result2.totalCount).toBe(0);

      // Should not find a user
      const result3 = await usersDataTable.loadItems({
        fuzzy: [
          {
            queryString: '@@@',
            columns: ['email'],
          },
        ],
        includeItemsCount: true,
      });
      expect(result3.items).toHaveLength(0);
      expect(result3.totalCount).toBe(0);
    });

    test('sort', async () => {
      // Create users with different first names
      const userA = await testService.factories.userFactory.create({
        firstName: 'Alice',
        lastName: 'Test',
        email: 'alice@test.com',
      });
      const userB = await testService.factories.userFactory.create({
        firstName: 'Bob',
        lastName: 'Test',
        email: 'bob@test.com',
      });

      // Sort ascending by firstName
      const resultAsc = await usersDataTable.loadItems({
        sort: [{ field: 'firstName', direction: 'ASC' }],
        includeItemsCount: true,
      });
      expect(resultAsc.items).toHaveLength(2);
      expect(resultAsc.items[0].id).toBe(userA.id);
      expect(resultAsc.items[1].id).toBe(userB.id);
      expect(resultAsc.totalCount).toBe(2);

      // Sort descending by firstName
      const resultDesc = await usersDataTable.loadItems({
        sort: [{ field: 'firstName', direction: 'DESC' }],
        includeItemsCount: true,
      });
      expect(resultDesc.items).toHaveLength(2);
      expect(resultDesc.items[0].id).toBe(userB.id);
      expect(resultDesc.items[1].id).toBe(userA.id);
      expect(resultDesc.totalCount).toBe(2);
    });

    test('count and skip', async () => {
      await testService.factories.userFactory.createMany(110);

      // Test default count
      const defaultResult = await usersDataTable.loadItems();
      expect(defaultResult.items).toHaveLength(12);

      // Test custom count
      const countResult = await usersDataTable.loadItems({ count: 10 });
      expect(countResult.items).toHaveLength(10);

      // Test count 200 should get max count of 100
      const overMaxResult = await usersDataTable.loadItems({ count: 200 });
      expect(overMaxResult.items).toHaveLength(100);

      // Test skip
      const skipResult = await usersDataTable.loadItems({
        count: 5,
        skip: 20,
        sort: [{ field: 'id', direction: 'ASC' }],
      });
      expect(skipResult.items).toHaveLength(5);
      // Verify these are the correct records by checking sequential IDs
      for (let i = 0; i < skipResult.items.length - 1; i++) {
        expect(BigInt(skipResult.items[i + 1].id)).toBeGreaterThan(BigInt(skipResult.items[i].id));
      }

      // Test min count (1)
      const minCountResult = await usersDataTable.loadItems({ count: -10 });
      expect(minCountResult.items).toHaveLength(1);
    });
  });

  describe('DataTable Service', () => {
    test('get data table list', async () => {
      const {
        domain: { dataTable },
      } = testService;

      const dataTables = dataTable.dataTableService.getDataTableList();
      expect(dataTables).toBeDefined();
      expect(dataTables.length).toBeGreaterThan(0);
    });

    test('get data table by id', async () => {
      const {
        domain: { dataTable },
      } = testService;

      const dataTableId = DataTableId.Users;
      const table = dataTable.dataTableService.getDataTable(dataTableId);
      expect(table).toBeDefined();
      expect(table.id).toBe(dataTableId);
    });

    test('load items from data table', async () => {
      const {
        domain: { dataTable },
      } = testService;

      const dataTableId = DataTableId.Users;
      const result = await dataTable.dataTableService.loadItems(dataTableId);
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });
});
