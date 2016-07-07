/* eslint-disable no-multi-spaces */
import { Schema } from 'mongoose';
import { extend } from 'lodash';
import fieldgroups from './fieldgroups';
import statics from './statics';
import hooks from './hooks';

const { ObjectId } = Schema.Types;

const schema = new Schema({
  id:           { type: String },
  title:        { type: String,   required: true },
  path:         { type: String },
  body:         { type: String,   default: '' },
  created:      { type: Date,     default: Date.now },
  postedFromIP: { type: String },
  user:         { type: ObjectId, required: true }
});

hooks(schema);

extend(schema.statics, statics, { fieldgroups });

schema.index({ user: -1 });
schema.index({ created: -1 });
schema.index({ user: -1, created: -1 });

export default schema;
