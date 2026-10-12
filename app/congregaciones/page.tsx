'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import OradoresBulk from '@/components/OradoresBulk';
import { inp, btn, btn2, card } from '@/lib/util';

const VACIA = { nombre: '', direccion: '', dia_reunion: '', horario: '', telefono: '' };

export default function Congregaciones() {
  const [lista, setLista] = useState<any[]>([]);
  const [f, setF] = useState<any>(VACIA);
  const [selId, setSelId] = useState('');
  const [msg, setMsg] = useState('');

  async function cargar() {
    const { data } = await supabase.from('congregaciones').select('*').order('nombre');
    setLista(data ?? []);
  }
  useEffect(() => { cargar(); }, []);

  async function guardar() {
    setMsg('');
    const { data, error } = await supabase.from('congregaciones').upsert(f, { onConflict: 'nombre' }).select('id').single();
    if (error) return setMsg('Error: ' + error.message);
    setMsg('Congregación guardada. Ahora puedes registrar sus oradores abajo.');
    setSelId(data.id); setF(VACIA); cargar();
  }

  async function borrar(id: string) {
    if (!confirm('¿Eliminar esta congregación?')) return;
    const { error } = await supabase.from('congregaciones').delete().eq('id', id);
    if (error) alert('No se puede eliminar: tiene oradores o salidas registradas.');
    cargar();
  }

  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <h1 className="text-2xl font-bold">Congregaciones y oradores</h1>

      <section className={card + ' space-y-2'}>
        <h2 className="font-semibold">Registrar nueva congregación</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className={inp} placeholder="Nombre de la congregación" value={f.nombre} onChange={set('nombre')} />
          <input className={inp} placeholder="Teléfono de contacto" value={f.telefono} onChange={set('telefono')} />
          <input className={inp} placeholder="Día de reunión (ej. domingo)" value={f.dia_reunion} onChange={set('dia_reunion')} />
          <input className={inp} placeholder="Horario (ej. 9:30 a. m.)" value={f.horario} onChange={set('horario')} />
          <input className={inp + ' sm:col-span-2'} placeholder="Dirección del Salón del Reino" value={f.direccion} onChange={set('direccion')} />
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        <button className={btn} onClick={guardar} disabled={!f.nombre.trim()}>Guardar congregación</button>
      </section>

      <section className={card + ' space-y-2'}>
        <h2 className="font-semibold">Registrar oradores visitantes en lote</h2>
        <select className={inp} value={selId} onChange={(e) => setSelId(e.target.value)}>
          <option value="">Elige la congregación…</option>
          {lista.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        {selId && <OradoresBulk tipo="visitante" congregacionId={selId} />}
      </section>

      <section className={card}>
        <h2 className="font-semibold mb-2">Catálogo de congregaciones</h2>
        <div className="overflow-auto">
          <table className="text-sm w-full">
            <thead><tr className="text-left border-b"><th className="p-1">Nombre</th><th>Dirección</th><th>Día y horario</th><th>Teléfono</th><th></th></tr></thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className="border-b align-top">
                  <td className="p-1 font-medium">{c.nombre}</td>
                  <td>{c.direccion}</td>
                  <td>{[c.dia_reunion, c.horario].filter(Boolean).join(' ')}</td>
                  <td>{c.telefono}</td>
                  <td className="text-right"><button className={btn2} onClick={() => borrar(c.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
