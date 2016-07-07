import { isObjectId, capitalize } from 'cd-common';
import { isArray, isEmpty } from 'lodash';
import assert from 'http-assert';
import constants from './constants';
import neo4j from '../../modules/db/neo4j';

const allowedTypes = Object.keys(constants);
const debug = __log.debug(`boilerplate:graph:lib`);

/**
 * Serializes an object or array of fields for cypher queries.
 */
export function getCypher(obj) {
  if (!obj || typeof obj !== 'object') return '';

  if (!isArray(obj)) {
    obj = Object.keys(obj);
  }

  return '{' + obj.map((d) => `${d}: {${d}}`).join(',') + '}';
}

/**
 * Creates a relationship of type `rel.type` from `source` to `target`
 */
export function createRelationship(rel = {}, source = {}, target = {}) {
  validateRelationship(rel, source, target);

  const sourceType = capitalize(source.type);
  const targetType = capitalize(target.type);

  const cypher = `
    MATCH (source:${sourceType}), (target:${targetType})
    WHERE source.oid = {soid} AND target.oid = {toid}
    CREATE UNIQUE (source)-[rel:${rel.type} ${getCypher(rel.props)}]->(target)
    RETURN rel
  `;

  const params = {
    soid: source.oid,
    toid: target.oid,
    ...(rel.props || {})
  };

  debug(`Creating relationship of type ${rel.type}`, params);

  return neo4j.cypherAsync({
    query: cypher,
    params: params
  });
}

/**
 * Deletes a relationship of type `rel.type` from `source` to `target`
 */
export function deleteRelationship(rel = {}, source = {}, target) {
  validateDelRelationship(rel, source);

  const sourceType = capitalize(source.type);
  const targetType = target ? `target:${capitalize(target.type)}` : '';
  const toidClause = target ? ' AND target.oid = {toid}' : '';

  let WHERE = `WHERE source.oid = {soid}${toidClause}`;

  if (!isEmpty(rel.props)) {
    for (const key in rel.props) {
      if (rel.props.hasOwnProperty(key)) {
        WHERE += ` AND rel.${key} = {${key}}`;
      }
    }
  }

  const cypher = `
    MATCH (source:${sourceType})-[rel:${rel.type}]->(${targetType})
    ${WHERE}
    DELETE rel
  `;

  const params = {
    soid: source.oid,
    ...(rel.props || {})
  };

  if (target) {
    params.toid = target.oid;
  }

  debug(`Deleting relationship of type ${rel.type}`, params, cypher);

  return neo4j.cypherAsync({
    query: cypher,
    params: params
  });
}

function validateRelationship(rel, source, target) {
  validateType(rel.type);
  assert(isObjectId(source.oid), 400, 'Source oid is not an Object ID');
  assert(isObjectId(target.oid), 400, 'Target oid is not an Object ID');
}

function validateDelRelationship(rel, source) {
  validateType(rel.type);
  assert(isObjectId(source.oid), 400, 'Source oid is not an Object ID');
}

function validateType(type) {
  assert(type, 400, 'Relationship type is required');
  assert(allowedTypes.indexOf(type) > -1, 400, `Unknown type ${type}`);
}

/**
 * Gets all the nodes in the graph db
 */
export async function getAll(type) {
  const result = await neo4j.cypherAsync({
    query: `MATCH (n${type ? ':' + type : ''}) RETURN n`
  });

  return result.map((r) => r.n);
}

/**
 * Gets all the relationships in the graph db
 */
export async function getAllRelationships(type) {
  const result = await neo4j.cypherAsync({
    query: `MATCH n -[rel${type ? ':' + type : ''}]->() RETURN rel`
  });

  return result.map((r) => r.rel);
}

/**
 * Clears all the nodes in the graph db
 */
export async function clearDatabase() {
  await neo4j.cypherAsync({
    query: 'MATCH (n) DETACH DELETE n'
  });
}
