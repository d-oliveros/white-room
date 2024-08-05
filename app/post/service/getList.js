import Post from '#post/model/postRepository.js';

export default {
  path: '/post/getList',
  // auth: withRoles([
  //   ROLE_ADMIN,
  //   ROLE_USER,
  // ]),
  async handler({ payload }) {
    console.log('P IS ', payload);
    const posts = await Post
      .select('*');

    return posts;
  },
};
