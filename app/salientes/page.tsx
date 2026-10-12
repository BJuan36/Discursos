'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fmtFecha, inp, btn, btn2, card } from '@/lib/util';

export default function Salientes() {
  const [locales, setLocales] = useState<any[]>([]);
  const [congs, setCongs] = useState<any[]>([]);
  const [temas, setTemas] = useState<any[]>([]);
  const [filas, setFilas] = useState<any[]>([]);
  const [f, setF] = useState<any>({ fecha: '', orador_id: '', bosquejo_numero: '', congregacion_destino_id: '', telefono: '' });
  const [msg, setMsg] = useState('');

  async function cargar() {
    const [{ data: o }, { data: c }, { data: s }] = await Promise.all([
      supabase.from('oradores').select('id, nombre').eq('tipo', 'local').order('nombre'),
      supabase.from('congregaciones').select('*').order('nombre'),
      supabase.from('salientes')
        .select('*, oradores(nombre), bosquejos(titulo), congregaciones(nombre, direccion, dia_reunion, horario)')
        .order('fecha', { ascending: false }),
    ]);
    setLocales(o ?? []); setCongs(c ?? []); setFilas(s ?? []);
  }
  useEffect(() => { cargar(); }, []);

  // Autocompletado: al elegir orador, solo se ofrecen los temas que tiene preparados
  async function elegirOrador(id: string) {
    setF({ ...f, orador_id: id, bosquejo_numero: '' });
    if (!id) return setTemas([]);
    const { data } = await supabase.from('oradores_bosquejos')
      .select('bosquejo_numero, bosquejos(titulo)').eq('orador_id', id).order('bosquejo_numero');
    setTemas(data ?? []);
  }

  // Autocompletado: al elegir destino, se llena el teléfono si lo tiene
  function elegirDestino(id: string) {
    const c = congs.find((x) => x.id === id);
    setF({ ...f, congregacion_destino_id: id, telefono: c?.telefono ?? f.telefono });
  }

  async function guardar() {
    setMsg('');
    const { error } = await supabase.from('salientes').insert({ ...f, bosquejo_numero: Number(f.bosquejo_numero) });
    if (error) return setMsg('Error: ' + error.message);
    setMsg('Salida registrada.');
    setF({ fecha: '', orador_id: '', bosquejo_numero: '', congregacion_destino_id: '', telefono: '' }); setTemas([]); cargar();
  }

  async function borrar(id: string) {
    if (!confirm('¿Eliminar esta salida?')) return;
    await supabase.from('salientes').delete().eq('id', id); cargar();
  }

  const dest = congs.find((c) => c.id === f.congregacion_destino_id);

  return (
    <>
      <h1 className="text-2xl font-bold">Oradores salientes</h1>
      <section className={card + ' space-y-2'}>
        <h2 className="font-semibold">Registrar salida de orador local</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <input type="date" className={inp} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
          <select className={inp} value={f.orador_id} onChange={(e) => elegirOrador(e.target.value)}>
            <option value="">Orador local…</option>
            {locales.map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
          </select>
          <select className={inp} value={f.bosquejo_numero} onChange={(e) => setF({ ...f, bosquejo_numero: e.target.value })} disabled={!f.orador_id}>
            <option value="">Tema (de los que tiene preparados)…</option>
            {temas.map((t) => <option key={t.bosquejo_numero} value={t.bosquejo_numero}>{t.bosquejo_numero}. {t.bosquejos?.titulo}</option>)}
          </select>
          <select className={inp} value={f.congregacion_destino_id} onChange={(e) => elegirDestino(e.target.value)}>
            <option value="">Congregación destino…</option>
            {congs.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input className={inp} placeholder="Teléfono" value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} />
          {dest && <p className="text-sm text-slate-600 self-center">{dest.direccion} · {[dest.dia_reunion, dest.horario].filter(Boolean).join(' ')}</p>}
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        <button className={btn} onClick={guardar} disabled={!f.fecha || !f.orador_id || !f.bosquejo_numero || !f.congregacion_destino_id}>Guardar salida</button>
      </section>

      <section className={card + ' overflow-auto'}>
        <table className="text-sm w-full">
          <thead><tr className="text-left border-b"><th className="p-1">Fecha</th><th>Orador</th><th>Tema</th><th>Destino</th><th>Teléfono</th><th></th></tr></thead>
          <tbody>
            {filas.map((s) => (
              <tr key={s.id} className="border-b align-top">
                <td className="p-1">{fmtFecha(s.fecha)}</td>
                <td>{s.oradores?.nombre}</td>
                <td>{s.bosquejo_numero}. {s.bosquejos?.titulo}</td>
                <td>{s.congregaciones?.nombre}<br /><span className="text-slate-500">{s.congregaciones?.direccion} · {[s.congregaciones?.dia_reunion, s.congregaciones?.horario].filter(Boolean).join(' ')}</span></td>
                <td>{s.telefono}</td>
                <td><button className={btn2} onClick={() => borrar(s.id)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
