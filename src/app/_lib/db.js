import { Pool } from "pg";

const isLocal = process.env.NODE_ENV === "development";

// Create the pool
const pool = new Pool({
  connectionString: process.env.POSTGRE_DATABASE_URL,
  ssl: process.env.POSTGRE_DATABASE_URL?.includes("localhost") || isLocal ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
});

pool.on("error", (error) => {
  console.error("Unexpected error occurred: ", error);
  process.exit(1);
});

export default pool;

export async function updateUserImage(userId, imagePath) {
  try {
    // console.log(`Starting image update for user ${userId} with path: ${imagePath}`);

    // Insert the new profile image
    await pool.query("INSERT INTO public.users_profile_photos (user_acct, profile_pic) VALUES ($1, $2) RETURNING id", [userId, imagePath]);
    // console.log(`Inserted profile image with ID: ${insertResult.rows[0].id}`);

    // Get the last inserted row result (latest profile_pic)
    const rowsResult = await pool.query("SELECT profile_pic FROM public.users_profile_photos WHERE user_acct = $1 ORDER BY id DESC LIMIT 1", [userId]);
    // console.log(`Retrieved ${rowsResult.rows.length} profile images for user ${userId}`);

    if (rowsResult.rows.length < 1) {
      throw new Error("Failed to retrieve inserted profile image");
    }

    const lastFile = rowsResult.rows[0].profile_pic;

    // Update the users table with the current profile image
    await pool.query("UPDATE public.users SET current_profile_image = $1 WHERE id = $2", [lastFile, userId]);
    // console.log(`Updated users table for user ${userId}, rows affected: ${updateResult.rowCount}`);

    // console.log(`Profile image updated for user ${userId}: ${lastFile}`);

    // Return updated image path
    return lastFile;
  } catch (error) {
    console.error("Error updating user image:", error);
    throw error;
  }
}

// Fetch current profile image for user
export async function getUserProfileImage(userId) {
  try {
    // console.log(`Getting profile image for user ${userId}`);

    const result = await pool.query("SELECT current_profile_image, id FROM public.users WHERE id = $1", [userId]);

    if (result.rows.length < 1) {
      console.log(`No user profile image found with ID ${userId}`);
      return null;
    }

    const user = result.rows[0];
    // console.log(`User ${userId} current_profile_image: ${user.current_profile_image}`);

    return user;
  } catch (error) {
    console.error("Error getting user profile image:", error);
    throw error;
  }
}
