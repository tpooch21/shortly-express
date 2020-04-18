const models = require('../models');
const Promise = require('bluebird');

// Middleware to handle logins? --> jumps to session.js model

// Creates new Session()

module.exports.createSession = (req, res, next) => {
  console.log('Logging request from Account creation test => ', req.body);
  let user = req.body;

  return models.Users.create({user: user.username, password: user.password})
  .then((result) => {
    console.log(result);
  });

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

//creates a new session.  Creating a new session requires an id(?)
