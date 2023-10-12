'use strict';

const mongoose = require('mongoose');


class Database {
  constructor() {
    this.connect("mongodb");
  }

  connect(type) {
    if (type === "mongodb") {
      if (1 === 1) {
        mongoose.set("debug", true);
        mongoose.set("debug", { color: true });
      }
      const connectString =
        'mongodb+srv://socialnetwork:IsBSBM6L1CFiiQWL@socialcluster.i599n1a.mongodb.net/SocialProDEV';

      mongoose
        .connect(connectString, {
          maxPoolSize: 50
        })
        .then(() => {
          console.log(`ConnectString: ${connectString}`);
          console.log('Connected to MongoDB');
        })
        .catch((err) => {
          console.log("Error connecting to MongoDB");
          console.log(err);
        });
    }
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceDB = Database.getInstance();
module.exports = instanceDB;
