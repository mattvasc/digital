const express = require('express');
const router = express.Router();
const locks = require('locks');
const { execSync, spawn } = require('child_process');

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
router.post('/', CriptoHelper.verifyJWT, async (req, res) => {

	let user: User;
	user = req.body;

	if (!user || !user.email || !user.name) {
		res.status(400).send({ error: "Bad request, invalid user object" });
		return;
	}
	try {
		await dao.registerUser(user, req['userId']);
		res.status(201).send('ok');
	} catch (error) {
		res.status(500).send(error);
	}
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
 * Tenta apagar um único usuário
 */
router.delete('/:id', CriptoHelper.verifyJWT, (req, res) => {
	const userId = req.params['id'] as any;

	if (isNaN(userId)) {
		res.status(400).send({ error: "ID Inválido" });
		return;
	}

	if (userId == req.userId) {
		res.status(400).send({ error: "Não é possível apagar a sí mesmo." });
		return;
	}

	dao.removeUser(userId, req.userId)
		.then(() => {
			res.status(200).send();
		})
		.catch(err => {
			res.status(500).send({ error: err });
		});


});

/**
 * Altera a senha do usuário atual.
 */
router.put('/:password', CriptoHelper.verifyJWT, (req, res) => {
	const old_pass = req.params['oldPwd'] as string;
	const new_pass = req.params['newPwd'] as string;

	if (old_pass == undefined || new_pass == undefined) {
		res.status(400).send({ error: "Provid oldPwd and newPwd" });
		return;
	}

	if (new_pass.length < 6) {
		res.status(400).send({ error: "Password must have at least 6 digits" });
		return;
	}


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
router.post('/:id/finger/:finger_id', CriptoHelper.verifyJWT, async (req, res) => {

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

		let ja_terminou_execucao = false;

		let callback_termino_execucao = async (error) => {

			if (error) {
				res.status(500).send({ error });
			} else {
				res.status(201).send();
			}
			ja_terminou_execucao = true;
			console.log('Soltando a Lock de cadastro de usuário.');
			execSync("sleep 1 && service digital start");
			await dao.insertFinger(userId, fingerId);
			lock_cadastro.unlock();
		};

		execSync("service digital stop && sleep 5");

		// Rodando o serviço de cadastro de forma assíncrona para poder matar ele caso demore muito.
		var child = spawn(`/digital/scan`, [userId, fingerId]);

		// https://nodejs.org/api/child_process.html#child_process_class_childprocess

		child.on('error', (err) => {
			console.log(`child process close all stdio with err ${err}`);
			callback_termino_execucao(err || "Erro desconhecido.");
		});

		child.on('exit', (code, signal) => {
			if (code != null) {
				console.log(`child process exited with code ${code}`);
				callback_termino_execucao(code);
			} else {
				console.log(`child process exited with signal ${signal}`);
				callback_termino_execucao(signal);
			}

		});

		setTimeout(() => {
			if (ja_terminou_execucao)
				return;
			child.kill(); // sigterm
		}, 90000); //1m30s



	} else {
		console.log('Acesso concorrente para cadastrar usuário detectado');
		res.status(400).send("Já existe uma operação de cadastro em andamento, tente novamente mais tarde!");
	}

});

module.exports = router;