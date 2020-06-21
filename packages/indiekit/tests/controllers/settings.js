import test from 'ava';
import * as settingsController from '../../controllers/settings.js';

import mockReqRes from 'mock-req-res';

const {mockRequest, mockResponse} = mockReqRes;
const request = mockRequest({params: {storeId: 'github'}});
const response = mockResponse();

test('Views all settings', async t => {
  await settingsController.viewAll(request, response);
  t.true(response.render.calledWith('settings/index'));
});

test('Edits application settings', async t => {
  await settingsController.editApplication(request, response);
  t.true(response.render.calledWith('settings/application'));
});

test('Edits puplication settings', async t => {
  await settingsController.editPublication(request, response);
  t.true(response.render.calledWith('settings/publication'));
});

test('Edits content store settings', async t => {
  await settingsController.editStore(request, response);
  t.true(response.render.calledWith('settings/github'));
});
