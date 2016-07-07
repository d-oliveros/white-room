/* eslint-disable no-multi-spaces */

export const post = {
  id:              { type: 'string',     index: 'no' },
  title:           { type: 'string',     store: true },
  path:            { type: 'string',     index: 'no' },
  body:            { type: 'string' },
  active:          { type: 'boolean',    index: 'no' },
  created:         { type: 'date',       index: 'no' },
  threadLevel:     { type: 'integer',    index: 'no' },
  askedTo:         { type: 'string',     index: 'no' },
  user:            { type: 'string',     index: 'no' },
  shortUrl:        { type: 'string',     index: 'no' },
  isProfane:       { type: 'boolean',    index: 'no' },
  softball:        { type: 'boolean',    index: 'no' },
  anonymous:       { type: 'boolean',    index: 'no' },

  counts: {          type: 'object',     properties: {
    comments:      { type: 'integer',    index: 'no' },
    appreciations: { type: 'integer',    index: 'no' },
    bestCommentAppreciations: { type: 'integer',    index: 'no'}
  }},

  lastCommentCreated: { type: 'date',       index: 'no' },

  userName:        { type: 'string',     index: 'no' },
  userPath:        { type: 'string',     index: 'no' },
  userImage:       { type: 'string',     index: 'no' },
  askedToPath:     { type: 'string',     index: 'no' },
  askedToName:     { type: 'string',     index: 'no' },

  suggestTitle:    { type: 'completion', analyzer: 'simple', search_analyzer: 'simple', payloads: true },
  edgeNgramTitle:  { type: 'string',     analyzer: 'edge_ngram_analyzer' },
  ngramTitle:      { type: 'string',     analyzer: 'ngram_analyzer' },

  comments: {        type: 'object',     properties: {
    id:            { type: 'string',     index: 'no' },
    body:          { type: 'string' },
    threadLevel:   { type: 'string',     index: 'no' },
    baseId:        { type: 'string',     index: 'no' },
    parentId:      { type: 'string',     index: 'no' },
    created:       { type: 'date',       index: 'no' },
    shortUrl:      { type: 'string',     index: 'no' },
    user:          { type: 'string',     index: 'no' },
    isOp:          { type: 'boolean',    index: 'no' },
    isProfane:     { type: 'boolean',    index: 'no' },
    anonymous:     { type: 'boolean',    index: 'no' },

    counts: {        type: 'object',     properties: {
      comments:    { type: 'integer',    index: 'no' },
      appreciations:{ type: 'integer',    index: 'no' }
    }},

    userName:      { type: 'string',     index: 'no' },
    userHeadline:  { type: 'string',     index: 'no' },
    userPath:      { type: 'string',     index: 'no' },
    userImage:     { type: 'string',     index: 'no' },

    comments: {      type: 'object',     properties: {
      id:          { type: 'string',     index: 'no' },
      body:        { type: 'string' },
      threadLevel: { type: 'string',     index: 'no' },
      baseId:      { type: 'string',     index: 'no' },
      parentId:    { type: 'string',     index: 'no' },
      created:     { type: 'date',       index: 'no' },
      shortUrl:    { type: 'string',     index: 'no' },
      user:        { type: 'string',     index: 'no' },
      isOp:        { type: 'boolean',    index: 'no' },
      isProfane:   { type: 'boolean',    index: 'no' },
      anonymous:   { type: 'boolean',    index: 'no' },

      counts: {          type: 'object',     properties: {
        comments:      { type: 'integer',    index: 'no' },
        appreciations: { type: 'integer',    index: 'no' }
      }},

      userName:    { type: 'string',     index: 'no' },
      userHeadline:{ type: 'string',     index: 'no' },
      userPath:    { type: 'string',     index: 'no' },
      userImage:   { type: 'string',     index: 'no' }
    }}
  }}
};

export const tag = {
  id:    { type: 'string',  index: 'no' },
  name:  { type: 'string',  store: true },
  suggestName: { type: 'completion', analyzer: 'simple', search_analyzer: 'simple', payloads: true },
  slug:  { type: 'string',  index: 'no' },
  count: { type: 'integer', index: 'no' }
};

export const user = {
  id:              { type: 'string',     index: 'no' },
  name:            { type: 'string',     store: true },
  active:          { type: 'boolean',    index: 'no' },
  suggestName:     { type: 'completion', analyzer: 'simple', search_analyzer: 'simple', payloads: true },
  edgeNgramName:   { type: 'string',     analyzer: 'edge_ngram_analyzer' },
  ngramName:       { type: 'string',     analyzer: 'ngram_analyzer' },
  path:            { type: 'string',     index: 'no' },
  image:           { type: 'string',     index: 'no' },
  headline:        { type: 'string',     index: 'no' },
  shortHeadline:   { type: 'string' },
  created:         { type: 'date',       index: 'no' },
  communityManaged:{ type: 'boolean',    index: 'no' },
  tags:            { type: 'string'},
  mainTag:         { type: 'string' }
};
