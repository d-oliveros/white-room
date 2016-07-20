import { map, chunk, reduce, each } from 'lodash';
import invariant from 'invariant';
import * as mappings from './mappings';
import * as factories from './factories';
import settings from './settings';
import client from './client';

const { index } = __config.search;
const debug = __log.debug('whiteroom:search');

/**
 * Ensures the search cluster's health, settings and indexes.
 */
export async function bootstrap() {
  debug('Bootstrapping');

  const reachable = await client.isReachable();

  if (!reachable) {
    debug(`Search cluster is not reachable. Aborting`);
    throw String('NOT_REACHABLE');
  }

  await createIndex(index);
  await waitForCluster(index);
  await putSettings(index, settings);
  await putMappings(index, mappings);
  await refreshIndex(index);
  return await waitForCluster(index);
}

/**
 * Waits for the search cluster to be ready
 */
export async function waitForCluster(index) {
  const options = {
    index: index,
    wait_for_status: 'yellow'
  };

  debug(`Waiting for cluster status: yellow`);

  const { status } = await client.cluster.health(options);
  debug(`Cluster health: ${status}`);

  if (status === 'red') {
    throw new Error(`The search cluster reports a bad health.`);
  }
}

/**
 * Ensures the index exist in elasticsearch
 */
export async function createIndex(index) {
  const exists = await client.indices.exists({ index });
  debug(`Index ${index} exists? ${exists}`);

  if (!exists) {
    debug(`Creating index: ${index}`);
    return await client.indices.create({ index });
  }
}

/**
 * Puts the index's settings.
 */
export async function putSettings(index, settings) {

  debug(`Closing index`);
  await client.indices.close({ index });

  debug(`Putting settings`);
  await client.indices.putSettings(settings);

  debug('Opening index');
  return await client.indices.open({ index });
}

/**
 * Puts the schema's mappings.
 */
export function putMappings(index, mappings) {
  let promise = Promise.resolve();

  const created = [];

  each(mappings, (body, type) => {
    promise = promise.then(() => {
      debug(`Checking if previous mappings exist for ${type}`);
      return client.indices.getMapping({ type, index });
    })
    .then((data) => {
      if (data[index] && data[index].mappings) {
        return debug(`Not putting ${type} mappings`);
      }

      debug(`Putting ${type} mappings`);
      created.push(type);

      return client.indices.putMapping({
        type: type,
        index: index,
        body: {
          [type]: {
            properties: mappings[type]
          }
        }
      });
    });
  });

  return promise.then(() => {
    debug(`Finished putting mappings`);
    return created;
  });
}

/**
 * Refreshes the index
 */
export async function refreshIndex(index) {
  debug('Refreshing index');
  return await client.indices.refresh({ index });
}


/**
 * Deletes an index
 */
export async function deleteIndex(index) {
  debug(`Deleting index ${index}`);

  await waitForCluster(index);
  await client.indices.close({ index });
  return await client.indices.delete({ index });
}

/**
 * Resets the indexes
 */
export async function resetIndex(index) {
  debug(`Resetting index ${index}`);

  const exists = await client.indices.exists({ index });

  if (exists) {
    await deleteIndex(index);
  }

  return await bootstrap();
}

/**
 * Resets and rebuilds the index.
 */
export async function resetAndRebuildIndex(index) {
  await resetIndex(index);
  return await rebuildIndex(index);
}

/**
 * Batch index a collection of documents
 */
export function batchIndex(index, type, docs) {
  invariant(factories[type], `No factory found for type ${type}`);

  const factory = factories[type];
  const documents = map(docs, factory);
  const startTime = Date.now();
  const chunkSize = 50;
  let count = 0;
  let chunks;

  // Chunk the documents in arrays of {chunkSize} items
  chunks = chunk(documents, chunkSize);

  debug(
    `Indexing the documents in chunks. ` +
    `${chunks.length} chunks with ${chunkSize} items each.`);

  let promise = Promise.resolve();

  chunks.forEach((chunk) => {
    const bulkOp = {
      index: index,
      type: type,
      refresh: false,
      body: reduce(chunk, (operations, document) => {
        operations.push({
          index: {
            _id: document._id
          }
        });

        operations.push(document._source);

        return operations;
      }, [])
    };

    count += chunk.length;
    promise = promise.then(() => client.bulk(bulkOp));
  });

  return promise
    .then((res) => {
      if (res && res.errors) {
        __log.error(JSON.stringify(res, null, 2));
        throw new Error(`Error while doing bulk operation`);
      }
      debug('Refreshing the index');
      return client.indices.refresh({ index, force: true });
    })
    .then(() => {
      return {
        executionTime: Date.now() - startTime,
        count: count
      };
    });
}

/**
 * Queries the Post, Tag and User collections for documents to index.
 * @return {Promise}  Promise to be resolved when the documents are loaded.
 */
export async function getDocumentsToIndex() {
  const { Post, Tag, User } = require('../../models');

  const postsQuery = {
    active: true,
    softball: {
      $ne: true
    },
    comments: { $not: { $size: 0 } }
  };

  const usersQuery = {
    active: true,
    'roles.admin': { $ne: true },
    'roles.driver': { $ne: true },
    managed: { $ne: true }
  };

  const [post, tag, user] = await Promise.all([
    Post.find(postsQuery).lean(),
    Tag.find({}).lean(),
    User.find(usersQuery).lean()
  ]);

  return { post, tag, user };
}

/**
 * Rebuild search's indexes
 * @return {Promise}  Promise to be resolved when the indexes are rebuilt.
 */
export function rebuildIndex(index) {
  __log.info('Rebuilding search\'s index.');

  let docCount = 0;
  const now = Date.now();
  const res = {};

  return getDocumentsToIndex()
    .then((groups) => {
      let promise = Promise.resolve();

      each(groups, (documents, type) => {
        promise = promise.then(() => {
          debug(`Adding ${documents.length} ${type} docs`);
          return batchIndex(index, type, documents);
        })
        .then((data) => {
          docCount += data.count;
          res[type] = data;
        });
      });

      return promise;
    })
    .then(() => {
      __log.info(
        `Search index has been rebuilt. ` +
        `Indexed documents: ${docCount}. ` +
        `Execution time: ${Date.now() - now}ms`);

      return res;
    });
}
