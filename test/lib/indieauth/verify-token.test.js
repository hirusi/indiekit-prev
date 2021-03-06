const nock = require('nock');
const test = require('ava');

const indieauth = require(process.env.PWD + '/lib/indieauth');
const client_id = 'https://gimme-a-token.5eb.nl/';

test.before(t => {
  t.context.token = process.env.TEST_INDIEAUTH_TOKEN;
});

test('Returns true if required scope is provided by token', async t => {
  const verifiedToken = await indieauth.verifyToken(t.context.token, {
    me: 'https://paulrobertlloyd.github.io/indiekit-sandbox/'
  });
  t.is(verifiedToken.client_id, client_id);
});

test('Throws error if no access token provided', async t => {
  const error = await t.throwsAsync(indieauth.verifyToken(null, {
    me: 'https://paulrobertlloyd.github.io/indiekit-sandbox/'
  }));
  t.is(error.message.error_description, 'No access token provided in request');
});

test('Throws error if no publication URL provided', async t => {
  const error = await t.throwsAsync(indieauth.verifyToken(t.context.token, {
    me: null
  }));
  t.is(error.message.error_description, 'Publication URL not configured');
});

test('Throws error if publication URL not authenticated by token', async t => {
  // Mock request
  const scope = nock('https://tokens.indieauth.com/')
    .get('/token')
    .reply(200, {
      me: 'https://paulrobertlloyd.github.io/indiekit-sandbox/'
    });

  // Setup
  const error = await t.throwsAsync(indieauth.verifyToken(t.context.token, {
    me: 'https://foo.bar'
  }));

  // Test assertions
  t.is(error.message.error_description, 'User does not have permission to perform request');
  scope.done();
});

test('Throws error if token endpoint does not return a me value', async t => {
  // Mock request
  const scope = nock('https://tokens.indieauth.com/')
    .get('/token')
    .reply(200, {
      me: null
    });

  // Setup
  const error = await t.throwsAsync(indieauth.verifyToken(t.context.token, {
    me: 'https://paulrobertlloyd.github.io/indiekit-sandbox/'
  }));

  // Test assertions
  t.is(error.message.error_description, 'There was a problem with this access token');
  scope.done();
});

test('Throws error if token endpoint returns an error', async t => {
  // Mock request
  const scope = nock('https://tokens.indieauth.com/')
    .get('/token')
    .reply(404, {
      error: 'Invalid request',
      error_description: 'The code provided was not valid'
    });

  // Setup
  const error = await t.throwsAsync(indieauth.verifyToken(t.context.token, {
    me: 'https://paulrobertlloyd.github.io/indiekit-sandbox/'
  }));

  // Test assertions
  t.is(error.message.error_description, 'The code provided was not valid');
  scope.done();
});

test('Throws error if can’t connect to token endpoint', async t => {
  // Mock request
  const scope = nock('https://tokens.indieauth.com/')
    .get('/token')
    .replyWithError('The code provided was not valid');

  // Setup
  const error = await t.throwsAsync(indieauth.verifyToken(t.context.token, {
    me: 'https://paulrobertlloyd.github.io/indiekit-sandbox/'
  }));

  // Test assertions
  t.is(error.message.error, 'FetchError');
  scope.done();
});
