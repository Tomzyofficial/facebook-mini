-- Create the users_profile_photos table if it doesn't exist
CREATE TABLE IF NOT EXISTS users_profile_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_acct VARCHAR(255) NOT NULL,
    profile_pic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_profile (user_acct)
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_acct ON users_profile_photos(user_acct); 