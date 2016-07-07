import { extend, find } from 'lodash';
import { objectIdsToStrings, shortHeadline } from 'cd-common';

/**
 * Transforms a mongo-formatted post document into an search-friendly object
 * @param  {Object}  doc  The document to process
 * @return {Object}       An object ready to be indexed by elasticsearch
 */
export function post(doc) {
  const post = docToObject(doc);
  const postId = post._id;
  delete post._id;

  // Duplicate the title so we can ngram-analyze it
  // without hurting the performance of other non-ngram queries
  post.ngramTitle = post.title;
  post.edgeNgramTitle = post.title;
  post.suggestTitle = post.title;

  // We have to denormalize the user's data on the comments
  if (post.comments && post.comments.length) {
    for (let i = 0, len = post.comments.length; i < len; i++) {
      post.comments[i] = commentFactory(post.comments[i]);
    }
  }

  return {
    _id: postId,
    _source: post
  };
}

/**
 * Transforms a mongo-formatted tag document into an search-friendly object
 * @param  {Object}  doc  The document to process
 * @return {Object}       An object ready to be indexed by elasticsearch
 */
export function tag(doc) {
  const tag = docToObject(doc);
  const tagId = tag._id;
  delete tag._id;

  tag.suggestName = tag.name;

  return {
    _id: tagId,
    _source: tag
  };
}

/**
 * Transforms a mongo-formatted user document into an search-friendly object
 * @param  {Object}  doc  The document to process
 * @return {Object}       An object ready to be indexed by elasticsearch
 */
export function user(doc) {
  const user = docToObject(doc);
  const userId = user._id;
  delete user._id;

  user.shortHeadline = shortHeadline(user.headline) || '';
  user.suggestName = user.name;
  user.edgeNgramName = user.name;
  user.ngramName = user.name;

  user.mainTag = (find(user.tags, { _id: user.mainTag }) || {}).name;

  user.tags = user.tags && user.tags.length
    ? user.tags.map((tag) => tag.name)
    : [];

  return {
    _id: userId,
    _source: user
  };
}

/**
 * The formatter used for the post's comments
 * @param  {Object}  doc  The comment to process
 * @return {Object}       An comment ready to be added to the base post's comments
 */
function commentFactory(doc) {
  const comment = doc.toObject ? doc.toObject() : extend({}, doc);
  comment.user = comment.anonymous || !comment.user ? null : comment.user.toString();

  if (comment.comments && comment.comments.length) {
    for (let i = 0, len = comment.comments.length; i < len; i++) {
      comment.comments[i] = commentFactory(comment.comments[i]);
    }
  }

  return comment;
}

/**
 * Transforms a mongo document to a plain object,
 * transforms the objectIDs to strings.
 *
 * @param  {Object}  doc  Mongoose-wrapped document to transform.
 * @return {Object}       Plain object
 */
function docToObject(doc) {
  const obj = doc.toObject ? doc.toObject() : extend({}, doc);
  objectIdsToStrings(obj);
  delete obj.__v;
  return obj;
}
