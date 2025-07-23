# Profile Image Upload Setup

This document explains how to set up and use the profile image upload functionality in your Facebook clone.

## Database Setup

1. Run the SQL script to create the required table:

```sql
-- Execute the contents of database_setup.sql
CREATE TABLE IF NOT EXISTS users_profile_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_acct VARCHAR(255) NOT NULL,
    profile_pic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_profile (user_acct)
);

CREATE INDEX IF NOT EXISTS idx_user_acct ON users_profile_photos(user_acct);
```

## File Structure

The profile image functionality consists of:

- `src/app/api/upload-profile-image/route.js` - Handles image uploads
- `src/app/api/get-profile-image/route.js` - Retrieves profile images
- `src/app/_lib/db.js` - Database functions
- `src/components/(user-profile)/Profile.js` - Profile component with upload functionality

## How It Works

### 1. Image Upload Flow

1. User clicks on the avatar in the Profile component
2. File input is triggered
3. User selects an image file
4. Image is immediately shown as preview
5. Image is uploaded to `/public/profileUploads/` directory
6. Image path is saved to database in `users_profile_photos` table
7. Profile component updates to show the uploaded image

### 2. Image Loading Flow

1. On page load, the Profile component checks for user session
2. If authenticated, it fetches the user's profile image from database
3. If an image exists, it's displayed; otherwise, default avatar is shown

## API Endpoints

### POST /api/upload-profile-image

Uploads a profile image for a user.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `image`: Image file
  - `userId`: User ID

**Response:**

```json
{
  "imageUrl": "/profileUploads/filename.jpg"
}
```

### GET /api/get-profile-image?userId={userId}

Retrieves a user's profile image.

**Response:**

```json
{
  "imageUrl": "/profileUploads/filename.jpg"
}
```

## Features

- ✅ Image preview before upload
- ✅ File type validation (images only)
- ✅ File size validation (5MB limit)
- ✅ Loading states during upload
- ✅ Error handling
- ✅ Automatic database updates
- ✅ Persistent storage across sessions

## Testing

You can use the `ProfileImageTest` component to test the functionality:

1. Import and add it to any page
2. It will simulate a user ID and allow you to test upload/retrieval
3. Check the browser console for any errors

## Troubleshooting

### Common Issues

1. **Upload directory not found**: Ensure `/public/profileUploads/` exists
2. **Database connection errors**: Check your MySQL connection settings
3. **Image not displaying**: Verify the image path is correct and accessible
4. **Permission errors**: Ensure the upload directory has write permissions

### Debug Steps

1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify database table exists and has correct structure
4. Test API endpoints directly using tools like Postman

## Security Considerations

- File size is limited to 5MB
- Only image files are accepted
- Files are stored in a public directory (consider moving to secure storage for production)
- User authentication is required for uploads
