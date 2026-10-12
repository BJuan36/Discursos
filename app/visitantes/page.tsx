'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { btn2, card, inp } from '@/lib/util';

export default function Visitantes() {
  const [filas, setFilas] = useState<any[]>([]);
  const [buscar, setBuscar] = useState('');

  async function cargar() {
    const { data } = await supabase
      .from('oradores')
      .select('id, nombre, telefono, congregaciones(nombre, dia_reunion, horario, direccion), oradores_bosquejos(bosquejo_numero)')
      .eq('tipo', 'visitante').order('nombre');
    setFilas(data ?? []);
  }
  useEffect(() => { cargar(); }, []);

  async function borrar(id: string) {
    if (!confirm('¿Eliminar este orador?')) return;
    const { error } = await supabase.from('oradores').delete().eq('id', id);
    if (error) alert('No se puede eliminar: aparece en el programa.');
    cargar();
  }

  const q = buscar.toLowerCase();
  const vis = filas.filter((o) => !q || o.nombre.toLowerCase().includes(q) || (o.congregaciones?.nombre ?? '').toLowerCase().includes(q));

  return (
    <>
      <h1 className="text-2xl font-bold">Bosquejos de visitantes</h1>
      <input className={inp} placeholder="Buscar por nombre o congregación" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
      <p className="text-sm text-slate-600">Para agregar visitantes ve a “Congregaciones”.</p>
      <div className={card + ' overflow-auto'}>
        <table className="text-sm w-full">
          <thead><tr className="text-left border-b"><th className="p-1">Orador</th><th>Congregación</th><th>Teléfono</th><th>Bosquejos</th><th>Reunión</th><th></th></tr></thead>
          <tbody>
            {vis.map((o) => (
              <tr key={o.id} className="border-b align-top">
                <td className="p-1 font-medium">{o.nombre}</td>
                <td>{o.congregaciones?.nombre}</td>
                <td>{o.telefono}</td>
                <td>{o.oradores_bosquejos.map((x: any) => x.bosquejo_numero).sort((a: number, b: number) => a - b).join(', ')}</td>
                <td>{[o.congregaciones?.dia_reunion, o.congregaciones?.horario].filter(Boolean).join(' ')}<br />{o.congregaciones?.direccion}</td>
                <td><button className={btn2} onClick={() => borrar(o.id)}>Eliminar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
