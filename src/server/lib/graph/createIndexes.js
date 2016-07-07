import neo4j from '../../modules/db/neo4j';

export default async function resetIndexes() {
  let queries = [
    'CREATE CONSTRAINT ON (p:Post) ASSERT p.oid IS UNIQUE',
    'CREATE CONSTRAINT ON (t:Tag) ASSERT t.oid IS UNIQUE',
    'CREATE CONSTRAINT ON (u:User) ASSERT u.oid IS UNIQUE'

    // Property existance constraints only available in entreprise edition
    // 'CREATE CONSTRAINT ON (p:Post) ASSERT exists(p.created)',
    // 'CREATE CONSTRAINT ON (t:Tag) ASSERT exists(u.created)',
    // 'CREATE CONSTRAINT ON (u:User) ASSERT exists(u.oid)',
    // 'CREATE CONSTRAINT ON (p:Post) ASSERT exists(p.oid)',
    // 'CREATE CONSTRAINT ON (t:Tag) ASSERT exists(t.oid)'
  ];

  queries = queries.map((q) => {
    return {
      query: q
    };
  });

  await neo4j.cypherAsync({ queries });
}
