import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — MAISON · ÉLITE',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: '#0f1117',
          color: '#e8e8e8',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}
