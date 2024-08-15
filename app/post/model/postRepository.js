import createRepository from '#whiteroom/server/createRepository.js';
import postModel from './postModel.js';

const postRepository = createRepository(postModel.tableName);

export default postRepository;
