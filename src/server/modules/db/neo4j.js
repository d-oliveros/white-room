import { GraphDatabase } from 'neo4j';
import { promisifyAll } from 'bluebird';

const { env } = process;
const isTest = env.NODE_ENV === 'test';

let db = {};

if (env.NEO4J_URL || env.NEO4J_TEST_URL) {
  db = new GraphDatabase({
    url: isTest ? env.NEO4J_TEST_URL : env.NEO4J_URL,
    auth: {
      user: (isTest ? env.NEO4J_TEST_USER : env.NEO4J_USER) || '',
      pass: (isTest ? env.NEO4J_TEST_PASS : env.NEO4J_PASS) || ''
    }
  });

  promisifyAll(db);
}

export default db;
