import typeCheck from '#white-room/util/typeCheck.js';

export default function nullify(fields) {
  typeCheck('fields::Array', fields);

  return fields.reduce((memo, fieldName) => ({
    ...memo,
    [fieldName]: null,
  }), {});
}
