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
                            group[idx].finger?.push(row.finger);
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

    public async registerUser(user: User, adminID: number): Promise<any> {
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

    public async verifyFingerExistence(userId: number, fingerID: number): Promise<boolean> {
        const database = Dao.db;
        const data = [userId, fingerID];
        const sql = `SELECT id FROM fingerprint WHERE user_id = ? AND finger = ?`;

        return new Promise((resolve, reject) => {

            database.get(sql, data, (err, row) => {
                if (err){
                    reject(err.message);
                    console.log(err);
                }
                if (row)
                    resolve(true);
                else
                    resolve(false);
            })
        });
    }

    public async insertFinger(userId: number, fingerId: number): Promise<any> {
        const updateFinger = await this.verifyFingerExistence(userId, fingerId);
        
        let sql = "";

        if (updateFinger) {
            console.log("Atualizando dedo de fulano...");
            sql = "UPDATE fingerprint SET recorded_at = date('now') WHERE user_id = ? AND finger = ?;";

        } else {
            console.log("Inserindo o dedo de fulano na base de dados...");
            sql = `INSERT INTO fingerprint (user_id, finger) VALUES (?, ?)`;
        }

       

        const data = [userId, fingerId];

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

    public getLogsByDate(date: string): Promise<Log[]> {
        const database = Dao.db;
        const sql = `SELECT l.id, l.date, f.finger, u.name, u.email, u.phone
        FROM log l 
        INNER JOIN fingerprint f ON l.fingerprint_id = f.id
        INNER JOIN user u ON f.user_id = u.id WHERE date(l.date) = ? ORDER BY l.id DESC`;

        return new Promise((resolve, reject) => {
            database.all(sql, [date], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve((rows || []).map(row => {
                            console.log(row);
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
