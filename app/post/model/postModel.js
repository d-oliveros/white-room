const postModel = {
  name: 'Post',
  tableName: 'posts',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: 'increment',
    },
    createdAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
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
};

export const editableFieldgroup = [
  'title',
  'content',
];

export default postModel;
