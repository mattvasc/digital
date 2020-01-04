var express = require('express');
var router = express.Router();

import Dao from '../dao';
import { Log } from '../interfaces';
import CriptoHelper from '../cripto_helper';


const dbpath = process.env.DB_PATH || '';
console.log(`dbpath: ${dbpath}`);
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

module.exports = router;