import { Schema } from 'mongoose';

const schema = new Schema({
  email:   { type: String, required: true },
  name:    { type: String, required: true },
  data:    { type: Object },
  created: { type: Date, required: true }
});

export default schema;
