import mongoose from 'mongoose';
mongoose.Promise = Promise;

const { host, db, replicaSet } = __config.database.mongo;

// Connect mongo to a replica set, if available
if (replicaSet) {
  mongoose.connect(replicaSet.uri, replicaSet.options, (err) => {
    if (err) {
      __log.error(err.stack);
      process.exit(1);
    }
  });
} else { // Or, connect mongo to a standalone instance
  mongoose.connect(`mongodb://${host}/${db}`);
}

export default mongoose.connection;
