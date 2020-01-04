INSERT INTO `user` (`name`, `email`, `phone`, `created_by_user_id`)
VALUES 
('Administrator', 'admin@admin', '12345678', NULL),
('user', 'user@user', '23456789', 1);

INSERT INTO `fingerprint` (`user_id`,`finger`) VALUES 
(1, 0),(2, 1), (2,2);

INSERT INTO `admin` (`user_id`, `password`) VALUES 
(1, 'b4798c3ed0db6b5a86113ab959376fb7b51c3ad9f9e49591fd47776eb0c1bb9603095cf8ec7ec7365e913ad2d53a6eea33cb35c1e0d2c3ddf0042252359e6941');

INSERT INTO `log` (`fingerprint_id`) VALUES 
(1),(2),(3),(1),(2),(3),(3);
