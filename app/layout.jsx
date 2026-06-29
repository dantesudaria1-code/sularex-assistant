import "./globals.css";

export const metadata = {
  title: "SULAREX Solar Assistant",
  description: "AI-powered solar assistant for SULAREX Solar Solutions — get a package recommendation and a free site assessment.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
