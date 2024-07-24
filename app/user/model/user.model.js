const UserModel = {
  name: 'User',
  tableName: 'users',
  columns: {
    id: { primary: true, type: 'int', generated: 'increment' },
    createdAt: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' },
    updatedAt: { type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' },
    deletedAt: { type: 'timestamp', nullable: true },
    firstName: { type: 'varchar' },
    lastName: { type: 'varchar' },
    email: { type: 'varchar', unique: true },
    slug: { type: 'varchar' },
    password: { type: 'varchar' },
    roles: { type: 'text', array: true },
    phone: { type: 'varchar', nullable: true, unique: true },
    profileImage: { type: 'varchar', nullable: true },
    signupIp: { type: 'varchar' },
    signupAnalyticsSessionId: { type: 'varchar' },
    signupUtmSource: { type: 'varchar', nullable: true },
    signupProvider: { type: 'varchar' },
    lastVisitAt: { type: 'timestamp', nullable: true },
    sessionCount: { type: 'int', default: 1 },
    experimentActiveVariants: { type: 'json', default: () => '\'{}\'' },
    shouldRefreshRoles: { type: 'boolean', default: false },
    isAdmin: { type: 'boolean', default: true },
  },
  indices: [
    { columns: ['slug'] },
    { columns: ['createdAt'] },
  ],
};

export const summaryFieldgroup = [
  'id',
  'firstName',
  'lastName',
  'email',
  'slug',
  'roles',
  'lastVisitAt',
  'phone',
  'createdAt',
  'sessionCount',
  'shouldRefreshRoles',
];

export const loginFieldgroup = [
  'id',
  'password',
];

export default UserModel;
