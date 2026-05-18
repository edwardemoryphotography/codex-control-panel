import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Legacy Codex',
  description: 'Legacy Codex v17 — Edward Emory Photography operational dashboard',
  other: { 'theme-color': '#0a0a0f' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
