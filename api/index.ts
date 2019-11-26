import express = require('express');
import { User } from './interfaces';
import Dao from './dao';

if (!process.env.SUDO_UID) {
    console.log("Process must run with sudo priveledges!");
    process.exit(403);
}

const app = express();
const port = 3000;

// Reading envoriment variables:
const dotenv = require('dotenv');
dotenv.config();

const dbpath = process.env.DBPATH || '';
const dao = new Dao(dbpath);



app.get('/', (_req, res) => {
    res.send('Hello World!');
});

app.get('/user', (_req, res) => {
    dao.getUsers().then((rows) => {
        res.send(rows);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

app.post('/user', (req, res) => {
    let user: User;
    user = req.body;

    if (!user || !user.email || !user.name) {
        res.status(400).send("Bad request, invalid user object");
        return;
    }

    dao.registerUser(user)
        .then(() => res.send('ok'))
        .catch(err => res.status(500).send(err));

});


app.get('/user/:id', (req, res) => {

    let userId = req.params['id'] as any;

    if (isNaN(userId)) {
        res.status(400).send("Invalid ID");
        return;
    }


    dao.getUserById(userId)
        .then(row => res.send(row))
        .catch(err => res.status(500).send(err));

});



app.get('/user/:id/finger', (req, res) => {

    let userId = req.params.id as any;

    if (isNaN(userId)) {
        res.status(400).send("Invalid ID");
        return;
    }


    dao.getFingersFromUser(userId)
        .then(rows => res.send(rows))
        .catch(err => res.status(500).send(err));
});

app.post('/user/:id/finger', (req, res) => {
    // TODO:
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
