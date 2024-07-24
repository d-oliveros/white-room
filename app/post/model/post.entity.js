import { EntitySchema } from 'typeorm';

const Post = new EntitySchema({
  name: 'Post',
  tableName: 'posts',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    title: {
      type: 'varchar',
    },
    content: {
      type: 'text',
      nullable: true,
    },
    published: {
      type: 'boolean',
      default: false,
    },
    authorId: {
      type: 'int',
      nullable: true,
    },
  },
  relations: {
    author: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'authorId',
        referencedColumnName: 'id',
      },
      nullable: true,
    },
  },
});

export default Post;
