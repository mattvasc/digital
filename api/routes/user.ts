var express = require('express');
var router = express.Router();

import Dao from '../dao';
import { User } from '../interfaces';
import CriptoHelper from '../cripto_helper';


const dbpath = process.env.DB_PATH || '';
console.log(`dbpath: ${dbpath}`);
const dao = new Dao(dbpath);

/**
 * Retorna todos os usuários
 */
router.get('/', CriptoHelper.verifyJWT, (_req, res) => {
	dao.getUsers().then((rows) => {
		res.send(rows);
	}).catch((err) => {
		res.status(500).send(err);
	});
});

/**
 * Cadastra um novo usuário
 */
router.post('/', CriptoHelper.verifyJWT, (req, res) => {
	let user: User;
	user = req.body;

	if (!user || !user.email || !user.name) {
		res.status(400).send({ error: "Bad request, invalid user object" });
		return;
	}

	dao.registerUser(user)
		.then(() => res.send('ok'))
		.catch(err => res.status(500).send(err));

});


/**
 * Retorna um único usuário
 */
router.get('/:id', CriptoHelper.verifyJWT, (req, res) => {

	let userId = req.params['id'] as any;

	if (isNaN(userId)) {
		res.status(400).send({ error: "Invalid ID" });
		return;
	}


	dao.getUserById(userId)
		.then(row => res.send(row))
		.catch(err => res.status(500).send(err));

});


/**
 * Retorna quais dedos o usuário já possuí cadastrado.
 */
router.get('/:id/finger', CriptoHelper.verifyJWT, (req, res) => {

	let userId = req.params.id as any;

	if (isNaN(userId)) {
		res.status(400).send({ error: "Invalid ID" });
		return;
	}


	dao.getFingersFromUser(userId)
		.then(rows => res.send(rows))
		.catch(err => res.status(500).send(err));
});

/**
 * Salva um novo dedo para o usuário
 */
router.post('/:id/finger', CriptoHelper.verifyJWT, (req, res) => {
	// TODO:
});

module.exports = router;