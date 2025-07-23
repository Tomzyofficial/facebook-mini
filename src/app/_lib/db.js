import mysql from "mysql2/promise";
// Create a connection pool
export const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  decimalNumbers: true,
  supportBigNumbers: true,
});

// check connection
export async function connectToDatabase() {
  try {
    const conn = await pool.getConnection();
    console.log("Connected to MySQL database");
    return conn;
  } catch (error) {
    console.error("Failed to connect to MySQL database:", error);
    return null;
  }
}

export async function updateUserImage(userId, imagePath) {
  try {
    console.log(`Starting image update for user ${userId} with path: ${imagePath}`);

    // Insert the new profile image
    const [insertResult] = await pool.query("INSERT INTO users_profile_photos (user_acct, profile_pic) VALUES (?, ?)", [userId, imagePath]);
    console.log(`Inserted profile image with ID: ${insertResult.insertId}`);

    // Get the last inserted row result
    const [rows] = await pool.query("SELECT profile_pic FROM users_profile_photos WHERE user_acct = ? ORDER BY id DESC LIMIT 1", [userId]);
    console.log(`Retrieved ${rows.length} profile images for user ${userId}`);

    const lastFile = rows.length ? rows[0].profile_pic : null;

    // Update the users table and set the current_profile_image column to the last inserted profile picture
    if (lastFile) {
      const [updateResult] = await pool.query("UPDATE users SET current_profile_image = ? WHERE id = ?", [lastFile, userId]);
      console.log(`Updated users table for user ${userId}, rows affected: ${updateResult.affectedRows}`);

      console.log(`Profile image updated for user ${userId}: ${lastFile}`);

      // Return the updated image path for immediate use
      return lastFile;
    } else {
      throw new Error("Failed to retrieve inserted profile image");
    }
  } catch (error) {
    console.error("Error updating user image:", error);
    throw error;
  }
}

/* export async function getUserById(userId) {
  try {
    const [rows] = await pool.query("SELECT * FROM users_profile_photos WHERE id = ?", [userId]);
    return rows[0];
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
} */

// This function queries the users table and returns result that matches the condition
export async function getUserProfileImage(userId) {
  try {
    console.log(`Getting profile image for user ${userId}`);

    const [rows] = await pool.query("SELECT user.current_profile_image, user.id, pp.user_acct FROM users AS user LEFT JOIN users_profile_photos AS pp ON user.id = pp.user_acct WHERE user.id = ?", [userId]);

    console.log(`Found ${rows.length} rows for user ${userId}`);

    if (rows.length < 1) {
      console.log(`No user found with ID ${userId}`);
      return null;
    }

    const user = rows[0];
    console.log(`User ${userId} current_profile_image: ${user.current_profile_image}`);

    return user;
  } catch (error) {
    console.error("Error getting user profile image:", error);
    throw error;
  }
}

// Get the latest profile image for a user from the users_profile_photos table
export async function getLatestProfileImage(userId) {
  try {
    console.log(`Getting latest profile image for user ${userId}`);

    const [rows] = await pool.query("SELECT profile_pic FROM users_profile_photos WHERE user_acct = ? ORDER BY id DESC LIMIT 1", [userId]);

    console.log(`Found ${rows.length} profile images for user ${userId}`);

    if (rows.length < 1) {
      console.log(`No profile images found for user ${userId}`);
      return null;
    }

    const latestImage = rows[0].profile_pic;
    console.log(`Latest profile image for user ${userId}: ${latestImage}`);

    return latestImage;
  } catch (error) {
    console.error("Error getting latest profile image:", error);
    throw error;
  }
}
