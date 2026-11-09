import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitro AI — ИИ-чат в стиле Liquid Glass",
  description:
    "Интеллектуальный ИИ-чат на базе Google Gemini в оптическом интерфейсе Liquid Glass с потоковой генерацией ответов.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2ff" },
    { media: "(prefers-color-scheme: dark)", color: "#060711" },
  ],
};

const themeInitScript = `
(function() {
  try {
    var saved = localStorage.getItem('vitro_liquid_glass_theme_v1');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = (saved === 'dark' || saved === 'light') ? saved : (prefersDark ? 'dark' : 'light');
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-950 dark:selection:bg-sky-400/30 dark:selection:text-sky-100">
        {children}
      </body>
    </html>
  );
}
