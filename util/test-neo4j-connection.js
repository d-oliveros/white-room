import { neo4j } from '../src/server/modules/db';

export default async function testNeo4jConnection() {
  try {
    await neo4j.cypherAsync('MATCH n RETURN n LIMIT 1');
    __log.info('Neo4j connection is OK');
  } catch (err) {
    __log.info('Neo4j connection is NOT OK');
  }
}
