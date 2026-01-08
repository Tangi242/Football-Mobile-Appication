-- Update all user passwords to use the new bcryptjs-compatible hash
-- Password for all users: Password123
-- This hash is compatible with bcryptjs: $2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi

UPDATE `users` 
SET `password_hash` = '$2b$10$FmrSsZIQY0OXnWMtKtAZlu0oDiEP/aVhRy6cnHoU/hcukqvaGbwfi'
WHERE `password_hash` = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
   OR `password_hash` LIKE '$2y$%';

-- Verify the update
SELECT id, email, role, SUBSTRING(password_hash, 1, 7) as hash_prefix, status 
FROM users 
ORDER BY id 
LIMIT 10;

