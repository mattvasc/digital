import { Router } from 'express';

import UsersController from '../controllers/users.controller';

class UsersRoutes {
    public router: Router;
    public usersController = UsersController;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.get('/', UsersController.index);
    }
}

export default new UsersRoutes();