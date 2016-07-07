import path from 'path';
import moment from 'moment';
import { capitalize } from 'cd-common';
import { sample, shuffle, times, random, defaults } from 'lodash';
import sizeOf from 'image-size';
import filesystem from '../src/server/modules/filesystem';
import * as searchLib from '../src/server/modules/search/lib';
import timeseries from '../src/server/modules/timeseries';
import updateUserStats from '../src/server/cron/tasks/updateUserStats';
import models from '../src/server/models';
import { User as UserAPI, Post as PostAPI, Tags as TagsAPI } from '../src/api';
import { clearDatabase } from '../test/util';
import config from '../config';
import createTestUser from './create-test-user';
import createAdmin from './create-admin';
import resetUserCategories from './reset-user-categories';
import resetUserAnsweredTags from './reset-user-answered-tags';
import resetUserSimilarInterests from './reset-user-similar-users';
import resetRelatedPosts from './reset-related-posts';

if (process.env.NODE_ENV === 'production') {
  throw new Error(`Data generator disabled on production.`);
}

const defaultParams = {
  users: 20,
  posts: 80,
  amas: 8,
  lists: 8,
  interests: 10,
  subscriptions: 6,
  tags: 40,
  views: 120,
  adminUser: true,
  testUser: false,
  verbose: true,
  reindex: true
};

const MANAGED_USERS = 4;
const startTime = Date.now();
const DUMMY_PROFILE_IMG = 'dummy-profile.jpg';
const DUMMY_BACKGROUND_IMG = 'dummy-background.jpg';
const DUMMY_ANSWER_IMGS = ['a1.jpg', 'a2.jpg', 'a3.jpg', 'a4.jpg', 'a5.jpg', 'a6.jpg', 'a7.jpg', 'a8.jpg', 'a9.jpg'];
const SEARCH_INDEX = config.search.index;

const { Post, List, Tag } = models;
const _random = [];
const users = [];
const posts = [];
const lists = [];
const tags = [];
const interests = [];
const categories = [];
let _managedUsers = 0;

const listLayouts = [
  'userHeroes',
  'userAvatars',
  'tags'
];

export default async function dataGenerator(params = {}) {
  defaults(params, defaultParams);

  if (params.verbose) {
    __log.info(
      `Generating ${params.users} users, ` +
      `${params.posts} posts, and ${params.tags} tags.`);
  }

  // If we are creating posts, we need at least one user
  if (params.posts && !params.users) {
    throw new Error(`Can't generate posts without users`);
  }

  // Clear the database
  await clearDatabase();

  // Create search indexes
  try {
    await searchLib.bootstrap();
  } catch (err) {}

  // Copies the dummy images to the uploads folder
  await ensureDummyImages();

  // Start the data generator
  await generateData(params);

  // Creates a test and admin user
  if (params.testUser) {
    await createTestUser();
  }

  if (params.adminUser) {
    await createAdmin();
  }

  // Reindex content
  if (params.reindex) {
    __log.info(`Resetting search index`);
    try {
      await searchLib.resetAndRebuildIndex(SEARCH_INDEX);
    } catch (err) {
      if (err === 'NOT_REACHABLE') {
        __log.warn('Elasticsearch is not reachable. Not indexing new content.');
      } else {
        __log.warn('Error with elasticsearch');
        __log.error(err);
      }
    }
  }

  if (params.verbose) {
    __log.info(
      `Created ${params.users} users, ` +
      `${params.posts} posts, and ${params.tags} tags.`);

    __log.info(`Data generator finished in ${Date.now() - startTime}ms.`);
  }

  return { users, posts, lists };
}

async function generateData(params) {

  // Generates random tags
  const newTags = times(params.tags, (i) => `Tag ${i + 1}`);
  const change = await Tag.processChange([], newTags);
  tags.push(...change.tags);

  // Generates random interests
  for (let i = 0, len = params.interests; i < len; i++) {
    interests.push(await randomInterest());
  }

  // Generates random users
  for (let i = 0, len = params.users; i < len; i++) {
    users.push(await randomUser());
  }

  // Generates random posts
  for (let i = 0, len = params.posts; i < len; i++) {
    posts.push(await randomPost());
  }

  // Generates random lists
  for (let i = 0, len = params.lists; i < len; i++) {
    lists.push(await randomList());
  }

  // Populate the data
  await addUserAppreciations(users, Math.min(params.posts, 3));
  await addTagHierarchy(tags);
  await addSubscriptions(users, params.subscriptions);
  await addAMAs(Math.min(params.amas, users.length));
  await resetUserCategories();
  await resetUserAnsweredTags();
  await resetUserSimilarInterests();
  await resetRelatedPosts();
  await addPostsViews(params.views);
  await updateUserStats();
}

async function randomInterest() {
  const { tags: [ interest ] } = await Tag.processChange([], [`Interest ${interests.length + 1}`]);
  const edits = { isInterest: true, categories: [] };

  for (let i = 0, len = 2; i < len; i++) {
    const category = await randomCategory();
    edits.categories.push(category._id);
  }

  return await TagsAPI.edit(interest._id, edits);
}

async function randomCategory() {
  const { tags: [ category ] } = await Tag.processChange([], [`Category ${categories.length + 1}`]);
  await TagsAPI.edit(category._id, { isParent: true });
  categories.push(category);

  const { tags: childrenTags } = await Tag.processChange([], times(2, (i) => `Tag ${tags.length + i + 1}`));

  for (let i = 0, len = childrenTags.length; i < len; i++) {
    const chilTag = childrenTags[i];
    const tag = await TagsAPI.edit(chilTag._id, { parentId: category._id });
    tags.push(tag);
  }

  return category;
}

async function randomUser() {
  let user = await UserAPI.createUser({
    name: capitalize(randomString(random(4), true)),
    headline: capitalize(randomString(random(3, 10))),
    summary: capitalize(randomString(random(7, 15))),
    image: DUMMY_PROFILE_IMG,
    locationBio: randomString(1),
    job: {
      title: capitalize(randomString(2)),
      company: capitalize(randomString(1)),
      companyUrl: `http://${randomString(1)}.com`
    },
    socialSites: [`http://${randomString(1)}.com`],
    backgroundImage: DUMMY_BACKGROUND_IMG,
    email: `user${users.length + 1}@wiselike.com`,
    password: 'test',
    managed: _managedUsers < MANAGED_USERS && users.length
  });

  if (user.managed) {
    _managedUsers++;
    const newRoles = Object.assign({}, user.roles, { driver: true });
    await UserAPI.edit(user._id, { roles: newRoles });
  }

  const userTags = tags.filter(() => random(100) > 50).map((t) => t.name);

  const interestedInTags = interests.filter(() => random(100) > 50).map((t) => t._id);

  user = await UserAPI.updateProfile(user._id, {
    tagsEdition: userTags,
    interestedInTags: interestedInTags
  });

  return user;
}

async function randomPost() {
  const shuffled = shuffle(users);
  const [user, askedToUser] = shuffled;

  // Create the post
  const post = await PostAPI.createPost(user._id, {
    active: true,
    anonymous: Math.random() > 0.7,
    body: randomParagraph() + '\n\n' + randomParagraph(),
    askedTo: askedToUser._id,
    title : capitalize(randomString(random(4, 12))) + '?'
  });

  // Set random created date
  await Post.update({ _id: post._id }, { created: randomDate() });

  // Answer post
  const isAnswered = Math.random() > 0.2;

  if (isAnswered) {
    const answer = await PostAPI.createComment(askedToUser._id, {
      baseId: post._id,
      bodyHTML: randomHTMLBody()
    });

    for (const replyUser of shuffled.slice(2, 5)) {
      await PostAPI.createComment(replyUser._id, {
        baseId: post._id,
        parentId: answer._id,
        body: randomParagraph() + '\n\n' + randomParagraph()
      });
    }
  }

  // Add post tags
  const baseId = post.id;
  const tagsEdition = shuffle(tags).slice(0, 3).map((t) => t.name);
  await PostAPI.edit(post._user, { baseId, tagsEdition });

  return await Post.findById(post._id);
}

async function randomList() {
  const layout = lists.length === 0
    ? 'heroSlideshow'
    : lists.length === 3
      ? 'following'
      : sample(listLayouts);

  const title = layout === 'following'
    ? 'Users you are following'
    : random(10) > 3 && layout !== 'heroSlideshow'
      ? randomString(3)
      : undefined;

  const list = {
    memo: randomString(3),
    title: title,
    layout: layout,
    active: true,
    weight: lists.length,
    slots: []
  };

  // Add the list's slots
  times(random(4, 10), () => {
    const hasBadge = random(10) >= 8;
    const sampleTag = sample(tags);

    list.slots.push({
      link: layout === 'tags' ? `${sampleTag.slug}` : sample(users).path,
      headline: randomString(4),
      image: DUMMY_PROFILE_IMG,
      backgroundImage: DUMMY_BACKGROUND_IMG,
      name: layout === 'tags' ? sampleTag.name : randomString(2),
      badge: hasBadge ? true : undefined,
      badgeLabel: hasBadge ? randomString(2) : undefined
    });
  });

  return await List.create(list);
}

async function addTagHierarchy(tags) {
  if (!tags.length) return;

  const childTags = tags.slice(0);
  const parentTags = childTags.splice(0, 3);

  await Promise.all(parentTags.map((tag) => {
    tag.isParent = true;
    return TagsAPI.edit(tag._id, { isParent: true });
  }));

  await Promise.all(childTags.map((tag) => {
    const parentId = tag.parentId = sample(parentTags)._id;
    return TagsAPI.edit(tag._id, { parentId });
  }));
}

async function addUserAppreciations(users, amount) {
  for (const user of users) {
    const toAppreciate = shuffle(posts).slice(0, amount);
    for (const post of toAppreciate) {
      await PostAPI.addAppreciation(user._id, {
        _id: post._id,
        threadLevel: 0
      });

      if (post.counts.comments && Math.random() > 0.5) {
        await PostAPI.addAppreciation(user._id, {
          _id: post.comments[0]._id,
          baseId: post._id,
          threadLevel: 1
        });
      }
    }
  }
}

async function addSubscriptions(users, number) {
  if (number > users.length) {
    number = users.length - 1;
  }

  for (const user of users) {
    const usersToAppreciate = shuffle(users)
      .filter((u) => u.id !== user.id)
      .slice(0, number);

    await Promise.all(usersToAppreciate.map((u) => { // eslint-disable-line
      return UserAPI.subscribe(user._id, u._id);
    }));
  }
}

async function addAMAs(amount) {
  for (let i = 0; i < amount; i++) {
    const nextDate = moment()
      .add((2 + (5 * i)), 'hours')
      .add(random(0, 3600), 'seconds')
      .toDate();
    await UserAPI.edit(users[i]._id, { amaStartDate: nextDate });
  }
}

async function addPostsViews(number) {
  await Promise.all(posts.map((post) => {
    return Promise.all(times(random(1, number), () => {
      return timeseries.recordPost(post._id, post.askedTo);
    }));
  }));
}

function randomDate(baseDate) {
  let date;

  if (baseDate) {
    date = moment(baseDate).add(random(120), 'minutes').toDate();
  } else {
    date = moment().subtract(random(10), 'days').toDate();
  }

  return date.getTime() > startTime ? new Date(startTime) : date;
}

function randomHTMLBody() {
  const paragraphCount = Math.ceil(Math.random() * 4) + 1;

  let HTMLBody = `<h2>${capitalize(randomString(random(3) + 1)) + '.'}</h2>`;
  for (let i = 0; i < paragraphCount; i++) {
    HTMLBody += `${randomHTMLparagraph()}`;
  }

  return HTMLBody;
}

function randomHTMLparagraph() {
  const tagFlag = random(1, 6);
  const endpoint = `${__config.server.host}:${__config.server.port}`;
  const imageHost = process.env.IMAGE_HOST || '';

  switch (tagFlag) {
    case 1:
      return `<blockquote>${randomParagraph()}</blockquote>`;
    case 2:
      return `<p><b>${randomParagraph()}</b></p>`;
    case 3:
      return `<p><i>${randomParagraph()}</i></p>`;
    case 4:
      return `<p><a href="http://www.google.com">${randomString()}</a></p>`;
    case 5:
      const answerRandomImg = Math.ceil(Math.random() * 9);
      const answerImgPath = `${imageHost || endpoint}/uploads/post-image/original/a${answerRandomImg}.jpg`;
      const answerImgLocalPath = path.resolve(__dirname, '..', 'public', 'uploads', 'post-image', 'original', `a${answerRandomImg}.jpg`);
      const imgDimensions = sizeOf(answerImgLocalPath);

      return `<div class="medium-insert-images medium-insert-active">` +
                `<figure>` +
                  `<img image-height="${imgDimensions.height}" image-width="${imgDimensions.width}" src="${answerImgPath}">` +
                `</figure>` +
              `</div>`;
    default:
      return `<p>${randomParagraph()}</p>`;
  }
}

function randomParagraph() {
  return capitalize(randomString(random(40) + 10)) + '.';
}

const bank = ['able', 'acid', 'angry', 'automatic', 'awake', 'bad', 'beautiful', 'bent', 'bitter', 'black', 'blue', 'boiling', 'bright', 'broken', 'brown', 'certain', 'cheap', 'chemical', 'chief', 'clean', 'clear', 'cold', 'common', 'complete', 'complex', 'conscious', 'cruel', 'cut', 'dark', 'dead', 'dear', 'deep', 'delicate', 'dependent', 'different', 'dirty', 'dry', 'early', 'elastic', 'electric', 'equal', 'false', 'fat', 'feeble', 'female', 'fertile', 'first', 'fixed', 'flat', 'foolish', 'free', 'frequent', 'full', 'future', 'general', 'good', 'gray', 'great', 'green', 'hanging', 'happy', 'hard', 'healthy', 'high', 'hollow', 'ill', 'important', 'kind', 'last', 'late', 'left', 'like', 'living', 'long', 'loose', 'loud', 'low', 'male', 'married', 'material', 'medical', 'military', 'mixed', 'narrow', 'natural', 'necessary', 'new', 'normal', 'old', 'open', 'opposite', 'parallel', 'past', 'physical', 'political', 'poor', 'possible', 'present', 'private', 'probable', 'public', 'quick', 'quiet', 'ready', 'red', 'regular', 'right', 'rough', 'round', 'sad', 'safe', 'same', 'second', 'secret', 'separate', 'serious', 'sharp', 'short', 'shut', 'simple', 'slow', 'small', 'smooth', 'soft', 'solid', 'special', 'sticky', 'stiff', 'straight', 'strange', 'strong', 'sudden', 'sweet', 'tall', 'thick', 'thin', 'tight', 'tired', 'true', 'violent', 'waiting', 'warm', 'wet', 'white', 'wide', 'wise', 'wrong', 'yellow', 'young', 'bamboozled', 'bazinga', 'bevy', 'bifurcate', 'bilirubin', 'bobolink', 'buccaneer', 'bulgur', 'bumfuzzle', 'canoodle', 'carbuncle', 'caterwaul', 'cattywampus', 'cheeky', 'conniption', 'coot', 'didgeridoo', 'dingy', 'doodle', 'doohickey', 'doozy', 'eschew', 'filibuster', 'finagle', 'flanker', 'floozy', 'fungible', 'girdle', 'gobsmacked', 'goombah', 'grog', 'gumption', 'gunky', 'hitherto', 'hoi-polloi', 'hornswoggle', 'hullabaloo', 'indubitably', 'janky', 'kahuna', 'katydid', 'kerplunk', 'kinkajou', 'knickers', 'loopy', 'manscape', 'monkey', 'mugwump', 'namby-pamby', 'nincompoop', 'noggin', 'pantaloons', 'passel', 'persnickety', 'popinjay', 'proctor', 'rapscallion', 'rookery', 'rumpus', 'scootch', 'scuttlebutt', 'shebang', 'shih-tzu', 'snarky', 'snuffle', 'spelunker', 'spork', 'sprocket', 'squeegee', 'succubus', 'tater', 'tuber', 'tuchis', 'viper', 'waddle', 'walkabout', 'wasabi', 'weasel', 'wenis', 'whatnot', 'wombat', 'wonky', 'zeitgeist'];
function randomString(amount, unique) {
  amount = amount || 1;

  if (!unique) {
    return sample(bank, amount).join(' ');
  }

  let result;

  do {
    result = sample(bank, amount).join(' ');
  } while (_random.indexOf(result) > -1);

  _random.push(result);

  return result;
}

async function ensureDummyImages() {
  filesystem.ensurePaths();

  const dummyImagesPath = path.resolve(__dirname, '..', 'public', 'images', 'dummy');

  const dummyProfilePath = path.resolve(dummyImagesPath, DUMMY_PROFILE_IMG);
  const dummyBackgroundPath = path.resolve(dummyImagesPath, DUMMY_BACKGROUND_IMG);

  const dummyAnswerImagesPath = DUMMY_ANSWER_IMGS.map(function(imageName) {
    return path.resolve(dummyImagesPath, 'answers', imageName);
  });

  const types = Object.keys(config.filesystem.types);

  for (let i = 0, len = types.length; i < len; i++) {
    const params = { type: types[i] };

    if (params.type === 'background' || params.type === 'slot' || params.type === 'post-background') {
      await filesystem.saveImage(dummyBackgroundPath, params);
    }

    if (params.type === 'post-image') {
      for (let i = 0; i < DUMMY_ANSWER_IMGS.length; i ++) {
        await filesystem.saveImage(dummyAnswerImagesPath[i], params);
      }
    }

    if (params.type === 'user') {
      await filesystem.saveImage(dummyProfilePath, params);
    }
  }
}
