
export default function addHooks(schema) {
  schema.pre('save', function(next) {
    if (this._id && !this.id) {
      this.id = this._id.toString();
    }

    next();
  });
}
