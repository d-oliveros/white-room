import bcrypt from 'bcrypt';

const SALT_WORK_FACTOR = 8;

export default function addHooks(schema) {

  // Populates the "id" field
  schema.pre('save', function populateIdField(next) {
    if (this._id && !this.id) {
      this.id = this._id.toString();
    }

    next();
  });

  // Hash password
  schema.pre('save', function hashPassword(next) {
    const user = this;

    // Only hash password if it has been modified, or is new
    if (!user.password || !user.isModified('password')) {
      return next();
    }

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) return next(err);

      // hash the password along with our new salt
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);

        // overrite the cleartext password with the hashed one
        user.password = hash;
        user.isChangingPassword = false;
        next();
      });
    });
  });

  // Set the user's path
  schema.pre('save', async function setUserPath(next) {
    const User = require('./index');
    const user = this;

    if (user.path || !user.name) {
      return next();
    }

    user.path = await User.generatePath(user.path || user.name);

    next();
  });
}
