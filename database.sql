PRAGMA foreign_keys = ON;
PRAGMA encoding="UTF-8";

CREATE TABLE `user` (`id` INTEGER PRIMARY KEY AUTOINCREMENT,  `name` varchar(128) NOT NULL,   `email` varchar(256) NOT NULL,   `phone` varchar(64));
CREATE TABLE `log` ( `id` INTEGER PRIMARY KEY AUTOINCREMENT,  `userid` INTEGER NOT NULL,  `date` datetime NOT NULL, FOREIGN KEY (userid) REFERENCES user(id));
CREATE TABLE `fingerprints` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `userid` INTEGER  ,  `fingerprint_id` INTEGER  ,  `finger` INTEGER,  FOREIGN KEY (userid) REFERENCES user(id));
