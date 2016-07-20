var env = process.env;
var host = env.ELASTICSEARCH_HOST;
var index = env.ELASTICSEARCH_INDEX;

module.exports = {
  host: host || '127.0.0.1:9200',
  index: env === 'test' ? 'boilerplate_test' : (index || 'boilerplate_local'),
  apiVersion: '2.2'
};
