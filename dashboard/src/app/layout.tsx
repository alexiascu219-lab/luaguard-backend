import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LuaGuard",
  description: "Enterprise Lua script protection platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        {/* Polyfill crypto.randomUUID for HTTP (non-localhost) access */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
              crypto.randomUUID = function() {
                return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, function(c) {
                  var n = +c;
                  return (n ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> n / 4).toString(16);
                });
              };
            }
          })();
        ` }} />
      </head>
      <body style={{ fontFamily: "'Outfit', sans-serif", background: '#050508', color: '#e8e6ff', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
