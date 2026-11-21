// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider }     from '@/context/AuthContext';
import { ThemeProvider }    from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Toaster }          from 'react-hot-toast';

export const metadata: Metadata = {
  title:       'DOM EXPRESS — Logistics',
  
  description: 'Cambodia\'s Trusted Logistics Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('dom_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  var lang = localStorage.getItem('dom_lang') || 'en';
                  document.documentElement.setAttribute('lang', lang);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    // Glass toast: translucent background + its own blur
                    background:           'var(--glass-strong)',
                    color:                'var(--text)',
                    border:               '1px solid var(--border2)',
                    fontFamily:           'var(--font)',
                    backdropFilter:       'blur(18px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(18px) saturate(140%)',
                  },
                  success: { iconTheme: { primary: '#22c55e', secondary: '#000' } },
                  error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                }}
              />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}