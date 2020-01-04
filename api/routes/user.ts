const express = require('express');
const router = express.Router();
const locks = require('locks');
const { execSync, execFileSync } = require('child_process');

import Dao from '../dao';
import { User } from '../interfaces';
import CriptoHelper from '../cripto_helper';


const dbpath = process.env.DB_PATH || '';
const dao = new Dao(dbpath);

const lock_cadastro = locks.createMutex();

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
		.then(() => res.status(201).send('ok'))
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

	const userId = req.params.id as any;

	// TODO: DRY
	if (isNaN(userId)) {
		res.status(400).send({ error: "Invalid User ID" });
		return;
	}


	dao.getFingersFromUser(userId)
		.then(rows => res.send(rows))
		.catch(err => res.status(500).send(err));
});

/**
 * Salva um novo dedo para o usuário
 */
router.post('/:id/finger/:finger_id', CriptoHelper.verifyJWT, (req, res) => {

	// #region Verificando Input
	const userId = req.params.id as number;
	const fingerId = req.params.finger_id as number;;
	
	// TODO: DRY
	if (isNaN(userId)) {
		res.status(400).send({ error: "Invalid User ID" });
		return;
	}
	
	if (isNaN(fingerId)) {
		res.status(400).send({ error: "Invalid Finger ID" });
		return;
	}
	// #endregion

	if (lock_cadastro.tryLock()) {
		console.log('Adquirindo a Lock de cadastro de usuário.');

		execSync("service digital stop");

		execFileSync(`sleep 1 && /digital/scan ${userId} ${fingerId}`)

		execSync("sleep 1 && service digital start");
		console.log('Soltando a Lock de cadastro de usuário.');
		lock_cadastro.unlock();
		res.status(201).send();
	} else {
		console.log('Acesso concorrente para cadastrar usuário detectado');
		res.status(400).send("Já existe uma operação de cadastro em andamento, tente novamente mais tarde!");
	}

	

	//

	// TODO:
});

module.exports = router;