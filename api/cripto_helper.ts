import jwt = require('jsonwebtoken');

import crypto = require('crypto');
import fs = require('fs');

// TODO: Left create command.
const privateKey = fs.readFileSync('jwt.key');

// openssl rsa -in jwt.key -pubout -outform PEM -out jwt.pem
const publicKey = fs.readFileSync('jwt.pem');

export default class CriptoHelper {
        private static privateJwtKey = fs.readFileSync('jwt.key');
        private static privateSalt = fs.readFileSync('salt.txt');

        /**
        * hash password with sha512.
        * @function
        * @param {string} password - password to be hashed
        * @returns - hashed password
        */
        public static sha512(password: string): string {
                /** Hashing algorithm sha512 */
                var hash = crypto.createHmac('sha512', CriptoHelper.privateSalt);
                hash.update(password);
                var value = hash.digest('hex');
                return value;
        };

        public static generateJwt(payload: object): string {
                return jwt.sign(payload, privateKey, {
                        algorithm: 'RS256',
                        expiresIn: 1800 // expires in 30min
                    });
        }

        /**
         * Função de middleware para authenticação de rotas.
         * @param req 
         * @param res 
         * @param next 
         */
        public static verifyJWT(req, res, next): void {
                var token = req.headers['x-access-token'];
                if (!token) return res.status(401).send({ auth: false, error: 'No token provided.' });

                jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
                        if (err) {
                                if (err.name == 'TokenExpiredError')
                                        return res.status(403).send({ auth: false, error: 'Token expirado!' })
                                console.log(err);
                                return res.status(400).send({ auth: false, error: 'Failed to authenticate token.' })
                        };

                        // se tudo estiver ok, salva no request para uso posterior
                        req.userId = decoded.id;
                        const currentTimeStamp = Math.ceil(new Date().getTime() / 1000);

                        res.header('TokenExpiresIn', decoded.exp - currentTimeStamp);

                        next();
                });
        }

}