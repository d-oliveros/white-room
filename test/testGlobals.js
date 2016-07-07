process.env.NODE_ENV = 'test';
process.env.JWT_TMP_EXPIRATION = '1s';

require('babel/register');
require('../loadenv');
require('../globals');
require('../src/server/database/mongo');
require('../src/server/database/redis');
