import sqlite3 = require('sqlite3');
import { User, Fingerprint, Log } from './interfaces';
import CriptoHelper from './cripto_helper';

// https://github.com/mapbox/node-sqlite3/wiki/API

export default class Dao {


    private static db: sqlite3.Database;
    constructor(private dbpath: string) {
        if (!Dao.db)
            Dao.db = new sqlite3.Database(this.dbpath, sqlite3.OPEN_READWRITE, (err) => {
                if (err) {
                    console.error(err.message);
                }
                console.log('Connected to the database.');
            });
    };

    // #region User's CRUD



    public getUsers(): Promise<User[]> {
        const sql = `SELECT * FROM user`;
        const database = Dao.db;
        return new Promise(function (resolve, reject) {
            database.all(sql, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });
    }

    public getUserById(userId: number): Promise<User> {
        const database = Dao.db;
        const sql = `SELECT * FROM user WHERE id = ?`;

        return new Promise((resolve, reject) => {
            database.get(sql, userId, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row || {});
            });
        });
    }



    public getFingersFromUser(userId: number): Promise<Fingerprint[]> {
        const database = Dao.db;
        const sql = `SELECT * FROM fingerprint WHERE userid = ?`;

        return new Promise((resolve, reject) => {

            database.all(sql, userId, (err, rows) => {
                if (err) {
                    reject(err.message);
                }
                resolve(rows || {});
            });
        });
    }

    // TODO: Pass user id.
    public registerUser(user: User): Promise<any> {
        const sql = `INSERT INTO user (name, email, phone, created_at) 
        VALUES
        (?, ?, ?, ?)`;

        const data = [user.name, user.email, user.phone, `datetime('now', 'localtime')`];

        return new Promise((resolve, reject) => {
            Dao.db.run(sql, data, (err) => {
                if (err)
                    reject(err.message);
                resolve();
            })
        });
    }

    // #endregion

    public login(email: string, password: string): Promise<number> {
        const database = Dao.db;
        const hashed_password = CriptoHelper.sha512(password);
        const sql = `SELECT user.id FROM admin INNER JOIN user ON (admin.user_id = user.id)
        WHERE user.email = ? AND admin.password = ?`;

        return new Promise((resolve, reject) => {
            database.get(sql, [email, hashed_password], (err, row) => {
                if (err)
                    reject(err.message);
                if (row)
                    resolve(row['id'] + 0);
                else
                    resolve(0);
            })
        });
    }

    // #region Logs
    public getLogs(): Promise<any> {
        const database = Dao.db;
        const sql = `SELECT * FROM log`;

        return new Promise((resolve, reject) => {
            database.all(sql, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });

    }
    // #endregion
}
