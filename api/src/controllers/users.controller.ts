import { Request, Response } from 'express';

class UsersController {
    /**
    * Usual names for CRUD methods are: index, store, update, delete 
    */
    public async index(_req: Request, res: Response): Promise<Response> {
        return res.send("Hellow world");
    }
}

export default new UsersController();
