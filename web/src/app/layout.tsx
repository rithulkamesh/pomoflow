import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "400", "500", "700"],
  display: "block",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta
        name="description"
        content="A distraction-free collaborative pomodoro timer."
      />

      <meta property="og:url" content="https://pomoflow.io" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Pomoflow" />
      <meta
        property="og:description"
        content="A distraction-free collaborative pomodoro timer."
      />
      <meta property="og:image" content="/banner_sm.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="pomoflow.io" />
      <meta property="twitter:url" content="https://pomoflow.io" />
      <meta name="twitter:title" content="Pomoflow" />
      <meta
        name="twitter:description"
        content="A distraction-free collaborative pomodoro timer."
      />
      <meta name="twitter:image" content="/banner_sm.png" />

      <body className={poppins.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
