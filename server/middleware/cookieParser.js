const parseCookies = (req, res, next) => {

  let cookieString = req.get('Cookie');

  console.log('logging cookie from request => ', cookieString);

  if (cookieString) {
    var parsedCookies = cookieString.split('; ').reduce((cookies, cookie) => {
      if (cookie) {
        let crumb = cookie.split('=');
        cookies[crumb[0]] = crumb[1];
      }
      return cookies;
    }, {});
  }

  req.cookies = parsedCookies;

  next();
};

module.exports = parseCookies;