import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
import "@fontsource/bricolage-grotesque";

export const metadata = {
  title: 'Nuclear',
  description: 'A notetaking superpower',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
