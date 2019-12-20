import { Router } from 'express';

import UserController from './controllers/user.controller';

const routes = Router();

routes.get('/', UserController.index);

export default routes;

