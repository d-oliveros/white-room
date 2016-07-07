var env = require('./env');
var isTest = env === 'test';

var config = {
  redis: {
    db: isTest ? '10' : process.env.REDIS_DB || '0',
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || '6379',
  }
};

// Stand-alone config
if (!process.env.MONGO_REPLICA_SET) {
  config.mongo = {
    db: isTest ? 'wiselike_test' : process.env.MONGO_DB || 'wiselike_local',
    host: process.env.MONGO_HOST || '127.0.0.1',
    pass: process.env.MONGO_PASS || null
  };
} else {
  // Replica set config
  config.mongo = {
    db: process.env.MONGO_DB,
    port: process.env.MONGO_PORT || '6379',
    replicaSet: {
      hosts: process.env.MONGO_REPLICA_HOSTS.split(',').map((host) => host.trim()),
      options: {
        replset: { replicaSet: process.env.MONGO_REPLICA_SET, connectTimeoutMS: 5000, keepAlive: 1 },
        server: { keepAlive: 1, connectTimeoutMS: 5000 },
        readPreference: 'PRIMARY',
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASS
      }
    }
  };

  const replicaSet = config.mongo.replicaSet;
  const hosts = replicaSet.hosts;
  const port = config.mongo.port;
  const db = config.mongo.db;

  // URI is in the following format:
  // mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
  replicaSet.uri = hosts.map(function(host, key) {
    const prefix = key === 0 ? 'mongodb://' : '';
    const suffix = key === (hosts.length - 1) ? '/' + db : '';
    return prefix + host + ':' + port + suffix;
  }).join(',');
}

module.exports = config;
