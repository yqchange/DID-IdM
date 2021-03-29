require("dotenv").config();
var Datastore = require("nedb");

let db;

module.exports = {
  init: function () {
    db = {};
    db.credentials = new Datastore({
      filename: "./src/api/mockCredentials/credentials.json",
      autoload: true,
    });
    db.representations = new Datastore({
      filename: "./src/api/mockCredentials/representations.json",
      autoload: true,
    });
    return db;
  },
  getCredentialsDB() {
    if (!db) {
      return null;
    }
    return module.exports.getDB().credentials;
  },
  getRepresentationsDB() {
    if (!db) {
      return null;
    }
    return module.exports.getDB().representations;
  },
  getDB: function () {
    if (!db) {
      return null;
    }
    return db;
  },
};
