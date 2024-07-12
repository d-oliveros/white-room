import createRepository from '#white-room/server/createRepository.js';

const userRepository = await createRepository('users', import.meta.url);

export default userRepository;
