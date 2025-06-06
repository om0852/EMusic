import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import ThemeProvider from "./components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Musicoul - Transform Your Musical Journey",
  description: "Elevate your musical skills with Musicoul's personalized learning experience. Join our community of passionate musicians and expert instructors.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
      >
        <ThemeProvider>
          <Navbar />
          <div>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
