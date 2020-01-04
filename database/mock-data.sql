INSERT INTO `user` (`name`, `email`, `phone`, `created_by_user_id`)
VALUES 
('Administrator', 'admin@admin', '12345678', NULL),
('user', 'user@user', '23456789', 1);

INSERT INTO `fingerprint` (`user_id`,`finger`) VALUES 
(1, 0),(2, 1), (2,2);

INSERT INTO `admin` (`user_id`, `password`) VALUES 
(1, 'asdf');

INSERT INTO `log` (`fingerprint_id`) VALUES 
(1),(2),(3),(1),(2),(3),(3);
