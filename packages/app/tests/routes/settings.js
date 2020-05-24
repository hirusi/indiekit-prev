import test from 'ava';
import supertest from 'supertest';

import app from '../../index.js';
import {client} from '../../config/db.js';

const request = supertest(app);

test.afterEach(() => {
  client.flushall();
});

test('Gets all settings', async t => {
  const response = await request.get('/settings');
  t.is(response.status, 200);
  t.is(response.type, 'text/html');
});

test('Gets application settings', async t => {
  const response = await request.get('/settings/application');
  t.is(response.status, 200);
  t.is(response.type, 'text/html');
});

test('Posts application settings', async t => {
  const response = await request.post('/settings/application')
    .send('foo=bar');
  t.is(response.status, 302);
});