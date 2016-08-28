import validators from './validators';

export const emailType = {
  type:      String,
  trim:      true,
  lowercase: true,
  unique:    true,
  sparse:    true,
  validate:  validators.email
};

export default { emailType };
