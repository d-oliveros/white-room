import createRepository from '#white-room/server/createRepository.js';
import UserModel from './userModel.js';
import methods from './methods/index.js';

const userRepository = createRepository(UserModel.tableName, methods);

export default userRepository;
