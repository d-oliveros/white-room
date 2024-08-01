import Post from '#post/model/postRepository.js';

export default {
  async handler() {
    const posts = await Post
      .select('*');

    return posts;
  },
};
