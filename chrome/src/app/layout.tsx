import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({ subsets: ['latin'], weight: ['100', '400', '700'] });

export const metadata: Metadata = {
    title: 'Pomotimer',
    description: 'Work in collaboration!',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body className={poppins.className}>
                <ThemeProvider attribute='class' defaultTheme='dark'>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
