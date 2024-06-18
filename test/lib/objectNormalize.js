import { assert } from 'chai';
import objectNormalize from '#common/util/objectNormalize.js';

describe('objectNormalize', () => {
  it('should serialize object paths', () => {
    const obj = {
      name: 'Abelardo',
      'address.street': 'Street .',
      'address.number': 122,
    };
    const transform = {
      name: 'Abelardo',
      address: {
        street: 'Street .',
        number: 122,
      },
    };

    assert.deepEqual(objectNormalize(obj), transform);
  });

  it('should serialize weird object paths', () => {
    const obj = {
      'roommateRelationships.user-232': 'Friend',
    };
    const transform = {
      roommateRelationships: {
        'user-232': 'Friend',
      },
    };

    assert.deepEqual(objectNormalize(obj), transform);
  });

  it('should serialize array paths', () => {
    const obj = {
      name: 'Abelardo',
      'address[0]': 'Street 123.',
      'address[1]': 'Street 512',
    };

    const transform = {
      name: 'Abelardo',
      address: ['Street 123.', 'Street 512'],
    };

    assert.deepEqual(objectNormalize(obj), transform);
  });

  it('should serialize complex paths', () => {
    const obj = {
      name: 'Abelardo',
      'address[0].street': 'Street 1.',
      'address[0].number': 122,
      'address[0].roommates.user123': 'Hi 123',
      'address[0].roommates.user501': 'Hello 501',
      'address[1].street': 'Street 2.',
      'address[1].number': 2145,
      'another[0].nested.object[0].withArrays': 'yes1',
      'another[1].nested.object[0].withArrays': 'yay2',
      'another[1].nested.object[1].withArrays': 'yay3',
    };

    const transform = {
      name: 'Abelardo',
      address: [
        {
          street: 'Street 1.',
          number: 122,
          roommates: {
            user123: 'Hi 123',
            user501: 'Hello 501',
          },
        },
        {
          street: 'Street 2.',
          number: 2145,
        },
      ],
      another: [
        {
          nested: {
            object: [
              {
                withArrays: 'yes1',
              },
            ],
          },
        },
        {
          nested: {
            object: [
              {
                withArrays: 'yay2',
              },
              {
                withArrays: 'yay3',
              },
            ],
          },
        },
      ],
    };

    assert.deepEqual(objectNormalize(obj), transform);
  });
});
