import sqlite3 = require('sqlite3');
import { User, Fingerprint } from './interfaces';
import CriptoHelper from './cripto_helper';

export default class Dao {
    private db: sqlite3.Database;
    constructor(private dbpath: string) {
        this.db = new sqlite3.Database(this.dbpath, (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the database.');
        });
    };


    public getUsers(): Promise<User[]> {
        const sql = `SELECT * FROM user`;
        const database = this.db;
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
        const database = this.db;
        const sql = `SELECT * FROM user WHERE id = ${userId}`;

        return new Promise((resolve, reject) => {
            database.get(sql, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row || {});
            });
        });
    }



    public getFingersFromUser(userId: number): Promise<Fingerprint[]> {
        const database = this.db;
        const sql = `SELECT * FROM fingerprint WHERE userid = ${userId}`;

        return new Promise((resolve, reject) => {

            database.all(sql, (err, rows) => {
                if (err) {
                    reject(err.message);
                }
                resolve(rows || {});
            });
        });
    }

    public registerUser(user: User): Promise<any> {
        const sql = `INSERT INTO user (name, email, phone, created_at) 
        VALUES
        (${user.name}, ${user.email}, ${user.phone}, datetime('now', 'localtime')`;

        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err)
                    reject(err.message);
                resolve();
            })
        });
    }

    // TODO: test-me
    public login(email: string, password: string): Promise<boolean> {
        const database = this.db;
        const hashed_password = CriptoHelper.sha512(password);
        
        const sql = `SELECT * FROM admin INNER JOIN user ON (admin.user_id = user.id)
        WHERE user.email = '${email}' AND admin.password = '${hashed_password}'`;

        return new Promise((resolve, reject) => {
            database.get(sql, (err, row) => {
                if (err)
                    reject(err.message);
                if(row)
                    resolve(true);
                else
                    resolve(false);
            })
        });
        
    }
}
