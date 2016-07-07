var env = require('./env');
var host = process.env.ELASTICSEARCH_HOST;
var index = process.env.ELASTICSEARCH_INDEX;

module.exports = {
  host: host || '127.0.0.1:9200',
  index: env === 'test' ? 'boilerplate_test' : (index || 'boilerplate_local'),
  apiVersion: '2.2'
};
