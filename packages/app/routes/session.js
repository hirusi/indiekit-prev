const debug = require('debug')('indiekit:app');
const express = require('express');
const {check, validationResult} = require('express-validator');
const IndieAuth = require('indieauth-helper');

// const config = require('./../config');

const auth = new IndieAuth({
  secret: 'test' // config.secret TODO: Get config secret
});

const router = new express.Router();

router.get('/:path(sign-in|log-in)?', (req, res) => {
  const {app} = req.app.locals;
  const {redirect} = req.query;
  let redirectUri = `${app.url}/auth`;

  if (redirect) {
    redirectUri = `${redirectUri}?redirect=${redirect}`;
  }

  auth.options.clientId = app.url;
  auth.options.redirectUri = redirectUri;

  debug('auth.options: %O', auth.options);
  res.render('sign-in');
});

router.post('/:path(sign-in|log-in)?', [
  check('url').isURL({require_protocol: true}).withMessage((value, {req, path}) => {
    return req.__(`error.validation.${path}`);
  })
], async (req, res) => {
  const {url} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('sign-in', {
      errors: errors.mapped(),
      url
    });
  } else if (url) {
    auth.options.me = url;
    try {
      const authUrl = await auth.getAuthUrl('code', ['create']);
      res.redirect(authUrl);
    } catch (error) {
      debug(req.originalUrl, error);
      res.render('sign-in', {
        error: error.message,
        url
      });
    }
  }
});

router.get('/auth', async (req, res, next) => {
  const {code, me, state} = req.query;
  const redirect = req.query.redirect || '/';
  debug('/auth query', req.query);
  if (code && state && auth.validateState(state)) {
    try {
      const token = await auth.getToken(code);
      req.session.me = me;
      req.session.token = token;
      res.redirect(redirect);
    } catch (error) {
      debug(req.originalUrl, error);
      next(error);
    }
  } else {
    next(new Error('Missing code or state mismatch'));
  }
});

router.get('/:path(sign-out|log-out)', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
