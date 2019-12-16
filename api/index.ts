import express = require('express');
import bodyParser = require('body-parser')


import Dao from './dao';
import CriptoHelper from './cripto_helper';

if (!process.env.SUDO_UID) {
    console.log("Process must run with sudo priveledges!");
    process.exit(403);
}




const app = express();

// parse application/json
app.use(bodyParser.json());



// Reading envoriment variables:
const dotenv = require('dotenv');
dotenv.config();

const dbpath = process.env.DB_PATH || '';
console.log(`dbpath: ${dbpath}`);
const dao = new Dao(dbpath);



app.get('/', (_req, res) => {
    res.send('Hello World!');
});



// #region Autenticação e autorização
app.post('/login', (req, res) => {
    if(!req.body || !req.body.user || !req.body.pwd) {
        console.log("Recebi um request de login com os campos:");
        console.log(req.body);
        return res.status(400).send({error: "Corpo ausente no login."});
        
    }
    
    dao.login(req.body.user, req.body.pwd)
    .then((userId: number) => {
        if(!userId) 
            return res.status(401).send({error: 'Login inválido!'});

        var token = CriptoHelper.generateJwt({id: userId});

        res.header('TokenExpiresIn', '1800');
    
        return res.status(200).send({ token });
    })
    .catch(err => {
        console.log(err);
        res.status(500).send({error: err});
    });
    

    

});
app.post('/logout', (req, res) => {
    res.status(200).send();
 });


// #endregion

app.use('/user', require('./user'));

// #region debug routes
if((process.env.DEBUG || '').toLowerCase() === 'true'){
    console.log("Criando rotas de debug");
    app.post('/encrypt', (req, res) => {
        const password = req.body.pwd;
        const hashed_password = CriptoHelper.sha512(password);
        res.status(200).send(hashed_password);
    });
}
    
// #endregion
const port = 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
