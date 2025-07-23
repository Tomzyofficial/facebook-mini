import { Geist, Geist_Mono } from "next/font/google";
import "@/app/styles/globals.css";

const geistSans = Geist({
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
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
      <body className={`${geistSans.className} ${geistMono.className} antialiased `}>{children}</body>
    </html>
  );
}
