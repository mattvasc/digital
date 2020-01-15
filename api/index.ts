import express = require('express');
var cors = require('cors');
import bodyParser = require('body-parser')
const { exec } = require('child_process');

import Dao from './dao';
import CriptoHelper from './cripto_helper';

if (!process.env.SUDO_UID) {
    console.log("Processo deve rodar com privilégios de super-usuário!");
    process.exit(403);
}

const app = express();

// parse application/json
app.use(bodyParser.json());

// Se houver problemas com Cors usar o seguinte:
// cors({credentials: true, origin: true})
const corsOptions = {
    exposedHeaders: 'new-token',
};
app.use(cors(corsOptions));

// Reading envoriment variables:
const dotenv = require('dotenv');
dotenv.config();

const dbpath = process.env.DBPATH || '';
console.log(`dbpath: ${dbpath}`);
const dao = new Dao(dbpath);



app.get('/', (_req, res) => {
    res.send('Hello World!');
});



// #region Autenticação e autorização
app.post('/login', (req, res) => {
    if (!req.body || !req.body.user || !req.body.pwd) {
        console.log("Recebi um request de login com os campos:");
        console.log(req.body);
        return res.status(400).send({ error: "Corpo ausente no login." });

    }

    dao.login(req.body.user, req.body.pwd)
        .then((userId: number) => {
            if (!userId)
                return res.status(401).send({ error: 'Login inválido!' });

            var token = CriptoHelper.generateJwt({ id: userId });

            res.header('TokenExpiresIn', '1800');

            return res.status(200).send({ token });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send({ error: err });
        });




});
app.post('/logout', (req, res) => {
    res.status(200).send();
});


// #endregion

app.use('/user', require('./routes/user'));
app.use('/log', require('./routes/log'));


// #region debug routes
if ((process.env.DEBUG || '').toLowerCase() === 'true') {
    console.log("Criando rotas de debug");
    app.post('/encrypt', (req, res) => {
        const password = req.body.pwd;
        const hashed_password = CriptoHelper.sha512(password);
        res.status(200).send(hashed_password);
    });
}

// #endregion
const port = 2000;
app.listen(port, () => console.log(`API listening on port ${port}!`));

console.log("\nIniciando servico da digital");
exec("/usr/sbin/service digital start", (error, stdout, stderr) => {
    if(error) {
        console.log("\nErro ao inicializar serviço da digital:");
        console.log(stderr.trim());
    }
    else
        console.log("Serviço da Digital Iniciado com sucesso!");
});