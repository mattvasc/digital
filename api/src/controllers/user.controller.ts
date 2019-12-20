import { Request, Response } from 'express';

class UserController {
    public async index(_req: Request, res: Response): Promise<Response> {
        return res.send("Hellow world");
    }  
}

export default new UserController();