import camelcase from 'camelcase';
import { chain } from 'lodash';
import { createRelationship } from './lib';
import constants from './constants';

const debug = __log.debug('whiteroom:graph:import');

export const queries = {
  tag: {},
  user: { managed: { $ne: true }},
  post: {}
};

/**
 * Re-creates the graph database using Mongo's dataset,
 */
export default async function importGraphDatabase(models) {
  __log.info(`Rebuilding graph database`);
  await createNodes(models);
  await createRelationships(models);
}

/**
 * Create nodes for each doc in the following models
 */
export async function createNodes(models) {
  const graphModels = require('../../models/Graph');

  // Create model nodes
  for (const modelName of ['User', 'Tag', 'Post']) {
    if (!models[modelName]) continue;

    const lcName = modelName.toLowerCase();
    const model = models[modelName];
    const graphModel = graphModels[modelName];
    const data = await model.find(queries[lcName]).lean();

    for (const item of data) {
      await graphModel.create(item);
    }
  }

  debug(`Finished creating graph nodes`);
}

/**
 * Create relationships for each node in the graph database
 */
export async function createRelationships(models) {
  for (const key of Object.keys(constants)) {
    const createRelationships = relationships[camelcase(key)];
    if (createRelationships) {
      await createRelationships(models);
    }
  }

  debug(`Finished creating relationships`);
}

export const relationships = {
  async posted({ Post }) {
    const posts = await Post
      .find({ _user: { $exists: true }})
      .select('_user')
      .lean();

    for (const post of posts) {
      const rel = {
        type: constants.POSTED
      };

      const source = {
        type: 'user',
        oid: post._user.toString()
      };

      const target = {
        type: 'post',
        oid: post._id.toString()
      };

      await createRelationship(rel, source, target);
    }
  },
  async isSubscribedTo({ User }) {
    const users = await User
      .find({ managed: { $ne: true }, 'subscriptions.0': { $exists: true }})
      .select('subscriptions')
      .lean();

    for (const user of users) {
      for (const subscription of user.subscriptions) {
        const rel = {
          type: constants.IS_SUBSCRIBED_TO
        };

        const source = {
          type: 'user',
          oid: user._id.toString()
        };

        const target = {
          type: 'user',
          oid: subscription
        };

        await createRelationship(rel, source, target);
      }
    }
  },
  async hasTag({ User, Post }) {
    const users = await User
      .find({ managed: { $ne: true }, 'tags.0.id': { $exists: true }})
      .select('tags.id mainTag')
      .lean();

    for (const user of users) {
      const userId = user._id.toString();

      for (const tag of user.tags) {

        // create HAS_TAG relationships
        await createRelationship({
          type: constants.HAS_TAG
        }, {
          type: 'user',
          oid: userId
        }, {
          type: 'tag',
          oid: tag.id
        });

        // create IS_MAIN_TAG relationships
        if (user.mainTag === tag.id) {
          await createRelationship({
            type: constants.IS_MAIN_TAG
          }, {
            type: 'user',
            oid: userId
          }, {
            type: 'tag',
            oid: tag.id
          });
        }
      }
    }

    const posts = await Post
      .find({ 'tags.0.id': { $exists: true }})
      .select('tags.id')
      .lean();

    for (const post of posts) {
      for (const tag of post.tags) {
        const rel = {
          type: constants.HAS_TAG
        };

        const source = {
          type: 'post',
          oid: post._id.toString()
        };

        const target = {
          type: 'tag',
          oid: tag.id
        };

        await createRelationship(rel, source, target);
      }
    }
  },
  async childOf({ Tag }) {
    const parentTags = await Tag
      .find({ isParent: true })
      .select('_id')
      .lean();

    const parentTagIds = parentTags.map((t) => t._id);

    const childTags = await Tag
      .find({ parentId: { $in: parentTagIds }})
      .select('parentId')
      .lean();

    for (const tag of childTags) {
      const rel = {
        type: constants.CHILD_OF
      };

      const source = {
        type: 'tag',
        oid: tag._id.toString()
      };

      const target = {
        type: 'tag',
        oid: tag.parentId
      };

      await createRelationship(rel, source, target);
    }
  },
  async answered({ Post }) {
    const posts = await Post.find({ 'comments._user': { $exists: true }});

    for (const post of posts) {
      const rel = {
        type: constants.ANSWERED,
        props: {
          created: new Date(post.created).getTime()
        }
      };

      const source = {
        type: 'user',
        oid: post.comments[0]._user.toString()
      };

      const target = {
        type: 'post',
        oid: post._id.toString()
      };

      await createRelationship(rel, source, target);
    }
  },
  async appreciated({ User, Post }) {
    const users = await User.find({
      managed: { $ne: true },
      'appreciations.0': { $exists: true }
    });

    const postIds = chain(users)
      .map((user) => user.appreciations)
      .flatten()
      .map((userId) => userId.toString())
      .uniq()
      .value();

    const posts = await Post
      .find({ $or: Post.threadQuery({ _id: { $in: postIds } }) })
      .select({
        'comments._id': true,
        'comments.comments._id': true
      })
      .lean();

    const tLevels = {};
    for (const post of posts) {
      tLevels[post._id.toString()] = 0;
      for (const answer of (post.comments || [])) {
        tLevels[answer._id.toString()] = 1;
        for (const reply of (answer.comments || [])) {
          tLevels[reply._id.toString()] = 2;
        }
      }
    }

    for (const user of users) {
      for (const appreciation of user.appreciations.map((id) => id.toString())) {
        const props = { threadLevel: tLevels[appreciation] };

        await createRelationship({
          type: constants.APPRECIATED,
          props: props
        }, {
          type: 'user',
          oid: user._id.toString()
        }, {
          type: 'post',
          oid: appreciation
        });
      }
    }
  },
  async interestCategory({ Tag }) {
    const tags = await Tag.find({ isInterest: true, categories: { $not: { $size: 0 }} });
    for (const tag of tags) {
      for (const categoryId of tag.categories) {
        await createRelationship({
          type: constants.INTEREST_CATEGORY
        }, {
          type: 'tag',
          oid: tag.id
        }, {
          type: 'tag',
          oid: categoryId
        });
      }
    }
  },
  async hasInterest({ User }) {
    const users = await User.find({ interestedInTags: { $exists: true, $not: { $size: 0 }}});
    for (const user of users) {
      for (const interest of (user.interestedInTags || [])) {
        await createRelationship({
          type: constants.HAS_INTEREST
        }, {
          type: 'user',
          oid: user._id
        }, {
          type: 'tag',
          oid: interest
        });
      }
    }
  }
};
