import { Request, Response } from 'express';

class AuthController {
    public async token(req: Request, res: Response): Promise<Response> {
        const a = req.body;
        
        return res.send("Send your credentials");
    }  
}

export default new AuthController();
