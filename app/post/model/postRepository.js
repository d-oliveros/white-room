import createRepository from '#white-room/server/createRepository.js';
import PostModel from './post.model.js';

const postRepository = await createRepository(PostModel.tableName);

export default postRepository;
