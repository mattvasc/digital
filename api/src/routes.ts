import { Router } from 'express';

import AuthController from './controllers/auth.controller';
import UserController from './controllers/users.controller';

const routes = Router();

// Auth
routes.post('/token', AuthController.token);

// Users
routes.get('/', UserController.index);

export default routes;
