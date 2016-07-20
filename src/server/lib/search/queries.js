import { sum, extend, isArray, isString, isNumber } from 'lodash';
import { stopwordsAll } from 'cd-common';
import inspect from 'util-inspect';
import assert from 'assert';
import client from './client';
import weights from './weights';
import * as mappings from './mappings';

const { index } = __config.search;
const types = Object.keys(mappings);
const debug = __log.debug('whiteroom:search:queries');

const defaultLimits = {
  user: 4,
  post: 8,
  tag: 8
};

/**
 * Runs an elasticsearch search query for all data types in parallel.
 */
export async function query(string) {
  if (!client.reachable) return notifyNotReachable();

  debug(`Querying for ${string}`);

  const results = await Promise.all(types.map((type) => fetch({ string, type })));
  const [posts, tags, users] = results;
  const total = sum(results, (result) => result.total);
  const hits = { posts, tags, users };

  debug(`Got ${total} hits in all data types for "${string}"`);

  return { total, ...hits };
}

/**
 * Executes an elasticsearch search query on a data type.
 */
export async function fetch(params) {
  if (!client.reachable) return notifyNotReachable();

  debug(`Fetching with params: ${inspect(params)}`);

  const { string, type, skip = 0 } = params;
  const limit = params.limit || defaultLimits[type];

  const searchParams = {
    index: index,
    type: type,
    size: limit,
    from: skip,
    body: {
      query: {
        multi_match: {
          query: string,
          fields: weights[type]
        }
      }
    }
  };

  if (type === 'tag') {
    extend(searchParams.body.query.multi_match, {
      fuzziness: 1,
      max_expansions: 10
    });
  }

  // Queries elasticsearch, groups the results by type
  const res = await client.search(searchParams);
  const hits = res.hits.hits.map((hit) => hit._source);
  const total = res.hits.total;

  debug(`Got ${total} hits, ${hits.length} results for ${inspect(params)}`);

  return { total, hits };
}

export async function getRelatedPosts({ fields = ['title'], minDocFreq = 5, title }) {
  assert(isArray(fields));
  assert(title && isString(title));
  assert(isNumber(minDocFreq));

  debug(`Getting related posts for "${title}"`, fields);

  const res = await client.search({
    index: index,
    type: 'post',
    size: 7,
    body: {
      query: {
        more_like_this: {
          fields: fields,
          like: title,
          min_term_freq : 1,
          min_doc_freq : minDocFreq,
          max_query_terms : 12,
          stop_words: stopwordsAll
        }
      }
    }
  });

  return (res.hits.hits || []).map((hit) => hit._source);
}

async function notifyNotReachable() {
  debug(`Search cluster is not reachable`);
  throw String('NOT_REACHABLE');
}


// Not being used anymore. Kept here for reference only
/*

import _ from 'lodash';
import ESPost from '../post.model';

export default function search(req, res) {
  req.checkBody('string', 'Query string is empty').notEmpty();
  var errors = req.validationErrors();

  if (errors)
    return res.status(400).json(errors);

  var query = _.pick(req.body, ['string', 'suggest', 'page']);

  ESPost.query(query).then((resp) => res.json(resp));
}

export let post = {
  query(params={}) {
    let windowSize = 10;
    let queryBody = {
      min_score: 0.3,
      query: {
        multi_match: {
          query: params.string,
          fields: ['title']
        }
      }
    };

    if (params.suggest) {
      queryBody.suggest = {
        suggest_title: {
          text: params.string,
          completion: {
            field: 'suggest_title',
            size: 3,
            fuzzy: {
              prefix_length: 8,
              fuzzyness: 5
            }
          }
        }
      };
    }

    return client.search({
      body: queryBody,
      index: index,
      type: 'post',
      size: windowSize,
      from: (params.page || 0) * windowSize
    });
  },

  autocomplete(params) {
    return client.suggest({
      body: {
        suggest_title: {
          text: params.string,
          completion: {
            field: 'suggest_title',
            size: 3,
            fuzzy: {
              prefix_length: 8,
              fuzzyness: 5
            }
          }
        }
      },
      index: index
    });
  },

  moreLikeThis(params) {
    return client.search({
      index: index,
      type: 'post',
      size: 6,
      body: {
        query: {
          more_like_this: {
            fields: ['title'],
            like_text: params.text,
            min_term_freq: 0,
            max_query_terms: 35,
            percent_terms_to_match: 0.01,
            stop_words: stopwordsAll
          }
        }
      }
    });
  }
};

*********************************************/
