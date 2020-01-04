PRAGMA foreign_keys = ON;
PRAGMA encoding="UTF-8";

CREATE TABLE `admin` (
    `user_id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `password` varchar(128) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE `user` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `name` varchar(128) NOT NULL,
    `email` varchar(256) NOT NULL,
    `phone` varchar(64),
    `created_at` DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
    `created_by_user_id` integer null,
    FOREIGN KEY (created_by_user_id) REFERENCES user(id),
    UNIQUE(email)
    );

CREATE TABLE `log` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `fingerprint_id` INTEGER NOT NULL,
    `date` DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
    FOREIGN KEY (fingerprint_id) REFERENCES fingerprint(id)
    );

CREATE TABLE `fingerprint` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `user_id` INTEGER,
    `finger` INTEGER CHECK (finger >= 0 AND finger < 10 ),
    `recorded_at` DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
    FOREIGN KEY (user_id) REFERENCES user(id)
    );

