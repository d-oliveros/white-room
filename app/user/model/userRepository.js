import createRepository from '#white-room/server/createRepository.js';
import UserModel from './user.model.js';
import methods from './methods/index.js';

const userRepository = await createRepository(UserModel.tableName, methods);

export default userRepository;
