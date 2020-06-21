import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';
import {templates} from '@indiekit/frontend';
import {session} from './config/session.js';
import * as error from './middleware/error.js';
import {locals} from './middleware/locals.js';
import {routes} from './routes/index.js';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const app = express();

// Correctly report secure connections
app.enable('trust proxy');

// Session
app.use(session);

// Parse application/json
app.use(express.json());

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));

// Static assets
app.use('/assets', express.static(path.join(__dirname, '/node_modules/@indiekit/frontend/assets')));

// Views
app.set('views', path.join(`${__dirname}`, 'views'));
app.engine('njk', templates(app).render);
app.set('view engine', 'njk');
app.use(locals);

// Routes
app.use(routes);

// Handle errors
app.use(error.notFound, error.internalServer);