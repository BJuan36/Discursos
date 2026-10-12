import './globals.css';
import AuthGate from '@/components/AuthGate';

export const metadata = { title: 'Discursos públicos' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
