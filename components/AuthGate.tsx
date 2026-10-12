'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { inp, btn } from '@/lib/util';

const LINKS = [
  ['/', 'Programa'],
  ['/agendar', 'Agendar'],
  ['/bosquejos', 'Bosquejos'],
  ['/visitantes', 'Visitantes'],
  ['/salientes', 'Salientes'],
  ['/congregaciones', 'Congregaciones'],
  ['/reportes', 'Reportes PDF'],
  ['/ajustes', 'Ajustes'],
];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(undefined);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setErr('Correo o contraseña incorrectos.');
  }

  if (session === undefined) return <p className="p-6">Cargando…</p>;

  if (!session)
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <form onSubmit={entrar} className="bg-white border rounded-lg p-6 w-full max-w-sm space-y-3 shadow-sm">
          <h1 className="text-xl font-bold">Discursos públicos</h1>
          <p className="text-sm text-slate-600">Inicia sesión para continuar.</p>
          <input className={inp} type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={inp} type="password" placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)} required />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button className={btn + ' w-full'}>Entrar</button>
        </form>
      </main>
    );

  return (
    <>
      <nav className="bg-teal-800 text-white px-4 py-2 flex flex-wrap gap-x-4 gap-y-1 items-center">
        <strong className="mr-2">Discursos</strong>
        {LINKS.map(([href, txt]) => (
          <Link key={href} href={href} className="hover:underline text-sm">{txt}</Link>
        ))}
        <button onClick={() => supabase.auth.signOut()} className="ml-auto text-sm underline">Salir</button>
      </nav>
      <main className="max-w-5xl mx-auto p-4 space-y-4">{children}</main>
    </>
  );
}
