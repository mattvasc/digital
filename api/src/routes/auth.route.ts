import { Router } from 'express';

import AuthController from '../controllers/auth.controller';

class AuthRoutes {
    public router: Router;
    public authController = AuthController;

    constructor() {
        this.router = Router();
        this.routes();
    }

    private routes() {
        this.router.post('/token', AuthController.token);
    }
}

export default new AuthRoutes();