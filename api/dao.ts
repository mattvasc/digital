import sqlite3 = require('sqlite3');
import { User, Fingerprint, Log, UserFingers } from './interfaces';
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
        const sql = `SELECT u.*, f.finger FROM user u LEFT JOIN fingerprint f ON u.id = f.user_id 
        WHERE u.deleted = 0 ORDER BY u.name`;
        const database = Dao.db;
        return new Promise(function (resolve, reject) {
            database.all(sql, (err, rows) => {
                if (err)
                    reject(err);
                else {
                    let finalGroup = [];
                    resolve((rows || []).reduce((group: UserFingers[], row) => {
                        const idx = group.findIndex(u => u.id == row.id);
                        if(idx >= 0 && row.finger != null) {
                            (group[idx].finger || []).push(row.finger);
                        }
                        else {
                            row.finger = row.finger != null ? [].concat(row.finger) : [];
                            group.push(row);
                        }

                        return group;
                    }, finalGroup));
                }
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

    public registerUser(user: User, adminID: number): Promise<any> {
        const sql = `INSERT INTO user (name, email, phone, created_by_user_id) 
        VALUES
        (?, ?, ?, ?)`;

        const data = [user.name, user.email, user.phone, adminID];

        return new Promise((resolve, reject) => {
            Dao.db.run(sql, data, (err) => {
                if (err)
                    reject(err.message);
                resolve();
            });
        });
    }

    public removeUser(userId: number, adminID: number): Promise<any> {
        const sql = `UPDATE user SET deleted = 1, deleted_by_user_id = ? WHERE id = ?;`;
        const data = [adminID, userId];
        return new Promise((resolve, reject) => {
            Dao.db.run(sql, data, (err) => {
                if (err)
                    reject(err.message);
                resolve();
            });
        });
    }

    // #endregion

    public login(email: string, password: string): Promise<number> {
        const database = Dao.db;
        const hashed_password = CriptoHelper.sha512(password);
        console.log(hashed_password);
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
    public getLogs(): Promise<Log[]> {
        const database = Dao.db;
        const sql = `SELECT l.id, l.date, f.finger, u.name, u.email, u.phone
        FROM log l 
        INNER JOIN fingerprint f ON l.fingerprint_id = f.id
        INNER JOIN user u ON f.user_id = u.id ORDER BY l.id DESC`;

        return new Promise((resolve, reject) => {
            database.all(sql, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve((rows || []).map(row => {
                            return {
                                id: row['id'],
                                date: row['date'],
                                fingerprint: {
                                    finger: row['finger'],
                                },
                                user: {
                                    name: row['name'],
                                    email: row['email'],
                                    phone: row['phone']
                                }
                        } as Log;
                    }));
            });
        });

    }
    // #endregion
}
