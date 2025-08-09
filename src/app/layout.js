import "@/app/styles/globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Facebook | Signin or create an account",
  description: "Facebook is a social media platform that allows you to connect with friends and family.",
  openGraph: {
    title: "Facebook | Signin or create an account",
    description: "Facebook is a social media platform that allows you to connect with friends and family.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialised`}>{children}</body>
    </html>
  );
}
