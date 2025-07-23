This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Project preview

This is a facebook clone (not entirely with all facebook functionalities) but it gives a little feel of facebook. This is just an ongoing demo project and I don't have any intention of using or hosting it. It is clearly for practical purposes. To create account, you will have to undergo five steps:

- You will fill up your fullname
- Input your date of birth
- Input your gender
- Input your email address
- And finally choose password of choice

On successful account creation, a session cookie would be created to track active user session. Clicking the logout button signs you out and cookie get's deleted. To sign in, you have to feel your email and password, upon successful sign in, session cookie is created to track active user session.

This project was built with Next.Js with React.Js for the UI, Next.Js POST/GET API routes for the user authentication and MySQL database CRUD, TailwindCSS for styling, and Material UI for icons.

### Project files/folder functionality

- **public** folder \/
- **images** folder which contains all the static site images
- **profileUploads** folder which contains users selected profile image

- **\_lib** folder \/
- **db.js** file creates the mysql pool, connectToDatabase function gets the connection pool and returns the connection.
  updateUserImage function holds two parameters userId (user's session Id) and imagePath (profile image path). This function inserts and also updates the database each time user selects a profile picture.
  getUserById function holds one parameter userId. This function returns user's id from the database.
  getUserProfileImage function the profile_pic column from the database and return each matching result based on the user's Id

- **definition.js** file holds the input validation objects from zod

- **session.js** file creates the session, verify, and delete the session cookie.

- **api** folder/endpoint \/
- **/auth/signin** route handles the user login authentication

- **/auth/signout** route handles the user signout logic.

- **/auth/signup** route handles the user signup authentication.

- **/fetchOtherUsers** route handles fetching other users from the database and populating the UI.

- **/get-profile-image** route receives userProfileImage function and waits for further instructions.

- **/handePost** route handles user post submission

-**upload-profile-image** POST Route – Profile Image Upload
Handles user profile image uploads in a Next.js API route:
Accepts multipart/form-data with userId and image.
Ensures the /public/profileUploads directory exists.
Validates file type (must be an image) and size (max 5MB).
Generates a unique filename using timestamp and random string.
Saves the image to disk and updates the user’s image path in the database via updateUserImage(userId, imagePath).
Returns the image URL in JSON response.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
