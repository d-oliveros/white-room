export const usersFixture = [
  {
    id: 1,
    createdAt: '2024-01-11 04:23:55.659576+00',
    updatedAt: '2024-01-11 04:23:55.659576+00',
    deletedAt: null,
    firstName: 'Admin',
    lastName: 'LastName',
    password: '$2a$08$3lzEjjM5p260NcCHoTBgK.wCHr..YGkd37zNjUUYdpoduMm5p9gwa',
    roles: [
      'admin'
    ],
    phone: '1111111111',
    email: 'admin@whiteroom.com',
    slug: 'admin-lastname',
    signupIp: '192.168.79.57',
    signupAnalyticsSessionId: 'e4fbb080-6135-11e7-9f74-512acb0deeaf',
    signupProvider: 'phone',
    sessionCount: 1
  },
  {
    id: 2,
    createdAt: '2024-01-11 04:23:55.659576+00',
    updatedAt: '2024-01-11 04:23:55.659576+00',
    deletedAt: null,
    firstName: 'User',
    lastName: 'LastName',
    password: '$2a$08$3lzEjjM5p260NcCHoTBgK.wCHr..YGkd37zNjUUYdpoduMm5p9gwa',
    roles: [
      'user'
    ],
    phone: '2222222222',
    email: 'user@whiteroom.com',
    slug: 'user-lastname',
    signupIp: '192.168.79.57',
    signupAnalyticsSessionId: 'e4fbb080-2345-11e7-9f74-512acb0deeaf',
    signupProvider: 'phone',
    sessionCount: 1
  }
];

export const seed = async function usersSeed(knex) {
  await knex('users').del();
  await knex('users').insert(usersFixture);
};
