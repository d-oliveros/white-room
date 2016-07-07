
/**
 * Defines the searchable fields for each data type, and their weights.
 *
 * Individual fields can be boosted with the caret (^) notation:
 * {
 *   "multi_match" : {
 *     "query" : "this is a test",
 *     "fields" : [ "title^3", "body" ],
 *   }
 * }
 * In this case, the title field is three times as important as the body field.
 *
 * @see https://www.elastic.co/guide/en/elasticsearch/reference/1.7/query-dsl-multi-match-query.html
 */
export default {
  post: [
    'title^6',
    'body^2',
    'comments.body'
  ],
  tag: [
    'name'
  ],
  user: [
    'name^14',
    'shortHeadline^8',
    'mainTag^4',
    'tags'
  ]
};
