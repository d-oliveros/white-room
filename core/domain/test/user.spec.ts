import type { UserCreateDto } from '@domain/user/user.schemas';
import { TestService } from './lib/TestService';
import { UserRole } from '@domain/user/user.constants';

describe('User Service', () => {
  const testService = new TestService({ context: 'domain' });

  beforeAll(async () => {
    await testService.initDataSource();
    await testService.resetData();
  });

  afterAll(async () => {
    await testService.destroyDataSource();
  });

  test('create and get user', async () => {
    const {
      domain: { user },
    } = testService;

    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      password: 'password123',
    } as UserCreateDto;

    const createdUser = await user.userService.createUser(userData);
    expect(createdUser).toBeDefined();
    expect(createdUser.email).toBe(userData.email);
    expect(createdUser.roles).toEqual([UserRole.User]);

    const fetchedUser = await user.userService.getById(createdUser.id);
    expect(fetchedUser).toBeDefined();
    expect(fetchedUser?.id).toBe(createdUser.id);
  });

  test('find user by email', async () => {
    const {
      domain: { user },
      factories: { userFactory },
    } = testService;

    const testUser = await userFactory.create();
    const foundUser = await user.userService.findByPhoneOrEmail({ email: testUser.email });

    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(testUser.id);
  });

  test('find user by phone', async () => {
    const {
      domain: { user },
      factories: { userFactory },
    } = testService;

    const testUser = await userFactory.create();
    const foundUser = await user.userService.findByPhoneOrEmail({ phone: testUser.phone });

    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(testUser.id);
  });

  test('find user by email or phone', async () => {
    const {
      domain: { user },
      factories: { userFactory },
    } = testService;

    const testUser = await userFactory.create();

    // Find by email
    const foundByEmail = await user.userService.findByPhoneOrEmail({
      email: testUser.email,
    });
    expect(foundByEmail).toBeDefined();
    expect(foundByEmail?.id).toBe(testUser.id);

    // Find by phone
    const foundByPhone = await user.userService.findByPhoneOrEmail({
      phone: testUser.phone,
    });
    expect(foundByPhone).toBeDefined();
    expect(foundByPhone?.id).toBe(testUser.id);
  });

  test('update user', async () => {
    const {
      domain: { user },
      factories: { userFactory },
    } = testService;

    const testUser = await userFactory.create();
    const newFirstName = 'Updated';

    await user.userService.updateUser(testUser.id, { firstName: newFirstName });
    const updatedUser = await user.userService.getById(testUser.id);

    expect(updatedUser).toBeDefined();
    expect(updatedUser?.firstName).toBe(newFirstName);
  });
});
