
/**
 * This file defines the different validator settings for the field types
 *
 * IMPORTANT: Validators are not executed when doing "update" or "findOneAndUpdate".
 * If you need those features, use the traditional approach of first retrieving the document.
 */
import validate from 'mongoose-validator';

export default {
  email: [
    validate({
      validator: 'isEmail',
      message: 'Not a valid email'
    })
  ],
  url: [
    validate({
      validator: 'isURL',
      passIfEmpty: true,
      message: 'Not a valid URL'
    })
  ]
};
