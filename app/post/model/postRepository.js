import createRepository from '#white-room/server/createRepository.js';

const postRepository = await createRepository('posts', import.meta.url);

export default postRepository;
