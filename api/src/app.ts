import express from 'express';

import AuthRoutes from './routes/auth.route';
import UsersRoutes from './routes/users.route';

class App {
    public express: express.Application;

    public constructor() {
       this.express = express(); 

       this.middlewares();
       this.routes();
    }

    private middlewares(): void {
        this.express.use(express.json());
    }
    
    private routes(): void {
        this.express.use('/', AuthRoutes.router);
        this.express.use('/api/user', UsersRoutes.router);
    }
}

export default new App().express;