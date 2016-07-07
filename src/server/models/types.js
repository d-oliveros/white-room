import validators from './validators';

export const email = {
  type:      String,
  trim:      true,
  lowercase: true,
  unique:    true,
  sparse:    true,
  validate:  validators.email
};

export default { email };
