import crypto = require('crypto');
import fs = require('fs');



export default class CriptoHelper {
        private static privateJwtKey = fs.readFileSync('jwt.key');
        private static privateSalt = fs.readFileSync('salt.txt');

        /**
        * hash password with sha512.
        * @function
        * @param {string} password - password to be hashed
        * @returns - hashed password
        */
        public static sha512(password: string) {
                /** Hashing algorithm sha512 */
                var hash = crypto.createHmac('sha512', CriptoHelper.privateSalt);
                hash.update(password);
                var value = hash.digest('hex');
                return value;
        };



}