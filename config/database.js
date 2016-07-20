var env = process.env;
var isTest = env.NODE_ENV === 'test';

var config = {
  redis: {
    db: isTest ? '10' : env.REDIS_DB || '0',
    host: env.REDIS_HOST || '127.0.0.1',
    port: env.REDIS_PORT || '6379'
  }
};

// Stand-alone config
if (!env.MONGO_REPLICA_SET) {
  config.mongo = {
    db: isTest ? 'whiteroom_test' : env.MONGO_DB || 'whiteroom_local',
    host: env.MONGO_HOST || '127.0.0.1',
    pass: env.MONGO_PASS || null
  };
} else {
  // Replica set config
  config.mongo = {
    db: env.MONGO_DB,
    port: env.MONGO_PORT || '6379',
    replicaSet: {
      hosts: env.MONGO_REPLICA_HOSTS.split(',').map((host) => host.trim()),
      options: {
        replset: { replicaSet: env.MONGO_REPLICA_SET, connectTimeoutMS: 5000, keepAlive: 1 },
        server: { keepAlive: 1, connectTimeoutMS: 5000 },
        readPreference: 'PRIMARY',
        user: env.MONGO_USER,
        pass: env.MONGO_PASS
      }
    }
  };

  const replicaSet = config.mongo.replicaSet;
  const hosts = replicaSet.hosts;
  const port = config.mongo.port;
  const db = config.mongo.db;

  // URI is in the following format:
  // mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
  replicaSet.uri = hosts.map((host, key) => {
    const prefix = key === 0 ? 'mongodb://' : '';
    const suffix = key === (hosts.length - 1) ? '/' + db : '';
    return prefix + host + ':' + port + suffix;
  }).join(',');
}

module.exports = config;
