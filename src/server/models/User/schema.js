/* eslint-disable no-multi-spaces */
import { Schema } from 'mongoose';
import { extend } from 'lodash';
import types from '../types';
import hooks from './hooks';
import fieldgroups from './fieldgroups';
import methods from './methods';
import statics from './statics';

const schema = new Schema({

  // Identity
  id:          { type: String },
  email:       { ...types.emailType },
  name:        { type: String,   trim: true },
  path:        { type: String,   unique: true, sparse: true },
  image:       { type: String },
  password:    { type: String },
  created:     { type: Date,     default: Date.now },
  random:      { type: Number,   default: Math.random },

  // Roles
  roles: {
    admin:     { type: Boolean,  default: false },
    anonymous: { type: Boolean,  default: false }
  },

  // Settings
  settings: {
    emailNotifications: {
      dummyEmail: { type: Boolean, default: true }
    }
  },

  // Geolocation fields
  signupIp:     { type: String },
  coordinates:  { type: [Number], index: '2dsphere' },
  location: {
    country:    { type: String },
    city:       { type: String },
    region:     { type: String }
  },

  // OAuth providers
  signupProvider: { type: String },
  providers: [{
    name:         { type: String },
    id:           { type: String }
  }],

  // OAuth tokens
  tokens: [{
    name:              { type: String },
    id:                { type: String },
    friends:           { type: Number },
    accessToken:       { type: String },
    accessTokenSecret: { type: String }
  }],

  // Logs
  logs: {
    lastVisit: { type: Date, default: Date.now },
    sessions:  { type: Number, default: 0 }
  }
});

hooks(schema);

extend(schema.methods, methods);
extend(schema.statics, statics, { fieldgroups });

schema.index({ path: 1 });
schema.index({ email: 1 });
schema.index({ active: 1, _id: 1 });
// schema.index({'coordinates': '2dsphere'});

export default schema;
