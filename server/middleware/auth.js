const models = require('../models');
const Promise = require('bluebird');

// Middleware to handle logins? --> jumps to session.js model

// Creates new Session()

module.exports.createSession = (req, res, next) => {
  console.log('Logging request from Account creation test => ');

  // Check if req has cookies, but also if it has cookies that represent a valid session in the database
    Promise.resolve(req.cookies.shortlyId)
    .then((hash) => {

      if (!hash) {
        throw hash;
      }

      return models.Sessions.get({hash});
    })
    .then((session) => {

      if (!session) {
        throw session;
      }

      return session;
    })
    .catch(() => {
      return models.Sessions.create()
      .then(results => {
        // get record from sessions table with id that matches insertId of newly created session
        return models.Sessions.get({ id: results.insertId });
      })
      .then(session => {
        res.cookie('shortlyId', session.hash);
        return session;
      })
    })
    .then(session => {
      req.session = session;
      next();
    })


};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

//creates a new session.  Creating a new session requires an id(?)
