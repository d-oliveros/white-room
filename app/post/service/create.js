// import {
//   ROLE_ADMIN,
//   ROLE_USER,
// } from '#user/constants/roles.js';
import buildZodSchemaFromModel from '#whiteroom/server/db/buildZodSchemaFromModel.ts';
import postModel, { editableFieldgroup } from '#post/model/postModel.js';
import postRepository from '#post/model/postRepository.js';

export default {
  path: '/post/create',
  // auth: rolesAuth([
  //   ROLE_ADMIN,
  //   ROLE_USER,
  // ]),
  roles: [
   // ROLE_ADMIN,
   // ROLE_USER,
  ],
  schema: buildZodSchemaFromModel(postModel, editableFieldgroup),
  async handler({ payload }) {
    const [newPost] = await postRepository
      .insert(payload)
      .returning('*');

    return newPost;
  },
};
