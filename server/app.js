const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const cookie = require('./middleware/cookieParser');
const models = require('./models');

const app = express();

// const router = require('express').Router();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


//
app.get('/',
(req, res) => {

  res.render('index');
});

app.get('/create',
(req, res) => {
  res.render('index');
});



app.get('/links',
(req, res, next) => {
  models.Links.getAll()
    .then(links => {
      res.status(200).send(links);
    })
    .error(error => {
      res.status(500).send(error);
    });
});

app.post('/links',
(req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    // res.send('your mother')
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then(link => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then(title => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin
      });
    })
    .then(results => {
      return models.Links.get({ id: results.insertId });
    })
    .then(link => {
      throw link;
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(link => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
//if user is not logged in, call get request to /login endpoint
app.get('/login',
(req, res) => {
  res.render('login');
  console.log(res)
});

app.get('/signup',
(req, res) => {
  res.render('signup');
});

//providing username and password to log in.
//no need to generate new session
app.post('/login',
(req, res) => {

  var isEqual;

  var user = req.body.username;
  // console.log(user)
  var password = req.body.password;
  // console.log(password)
  models.Users.getUserInfo(user)
  .then(results => {
    isEqual = models.Users.compare(password, results.password, results.salt);
    // console.log('ISEQUAL IS ',isEqual);
    if (isEqual === true) {
      console.log('TRUE')
      res.render('index')
    } else {
      console.log('FALSE')
      res.render('signup')
    }
  })
  .catch((err) => res.sendStatus(404));



  // is (!isEqual) {
  // throw (err)
  /*
  */
  // }

  // models.Users.compare
});

//providing username and password to create a profile.
//create a new session to associate with that profile.
app.post('/signup',
  (req, res) => {
  // req.body ={username: x, password: x}

    //check database to see if user already exists there.
    //call Model.get()
    //req.body.username
    //req.body.password


  models.Users.getUserInfo(req.body.username)
  .then((results) => {
    console.log('Logging results from user Check => ', results);
    //if results are undefined, craete new user in db
    if (results === undefined) {
      return models.Users.create(req.body);
//bring the user to index
    } else {
      res.render('signup');
    }
  })
  .then((results) => {
    console.log('See if this is being hit => ', results);
    res.render('index');
  })
  .catch(err => {
    console.log('WE ARE GETTING AN ERROR: ', err);
  })


// req.body = {username: x, password: x}


// {user: req.body.username, password: req.body.password}



  // models.Users.create(req.body)
  // .then((results) => {
  //   console.log('Logging results from promise resolve => ', results);
  //   res.status(200).render('index');
  // })
  // .catch((err) => {
  //   console.log('Err from duplicate user => ', err);

  //   res.sendStatus(404);
  // });

  // console.log('REQUEST: ', req.body)
  // res.render('login');
});

/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
