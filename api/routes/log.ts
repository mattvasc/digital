var express = require('express');
var router = express.Router();

import Dao from '../dao';
import { Log } from '../interfaces';
import CriptoHelper from '../cripto_helper';
import { userInfo } from 'os';


const dbpath = process.env.DB_PATH || '';
const dao = new Dao(dbpath);

/**
 * Retorna todos os logs do sistema
 */
router.get('/', CriptoHelper.verifyJWT, (_req, res) => {
	dao.getLogs().then((logs: Log[]) => {
		res.send(logs);
	}).catch((err) => {
		res.status(500).send(err);
	});
});

/**
 * Retorna todos os logs do sistema por determinada data
 */
router.post('/', CriptoHelper.verifyJWT, (req, res) => {
	let date = req.body.date;

	dao.getLogsByDate(date).then((logs: Log[]) => {
		res.send(logs);
	}).catch((err) => {
		res.status(500).send(err);
	});
});

module.exports = router;