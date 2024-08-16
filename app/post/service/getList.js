import Post from '#post/model/postRepository.js';

export default {
  path: '/post/getList',
  // auth: withRoles([
  //   ROLE_ADMIN,
  //   ROLE_USER,
  // ]),
  async handler() {
    const posts = await Post
      .select('*');

    return posts;
  },
};
