/* eslint-disable no-var */

var path = require('path');
var ROOTDIR = path.resolve(__dirname, '..');

module.exports = {
  root: ROOTDIR + '/public/uploads',
  tmp: ROOTDIR + '/public/uploads/tmp',

  types: {
    user: {
      sizes: ['40', '70', '200', 'original'],
      s3: true
    }
  }
};
