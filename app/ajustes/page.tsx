'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { inp, btn, card } from '@/lib/util';

const CAMPOS: [string, string][] = [
  ['congregacion', 'Nombre de tu congregación'],
  ['direccion_salon', 'Dirección del Salón del Reino'],
  ['horario', 'Día y hora de la reunión (ej. domingo 9:30 a. m.)'],
  ['encargado', 'Hermano(s) encargado(s) de los discursos'],
  ['telefono_encargado', 'Teléfono del encargado'],
];

export default function Ajustes() {
  const [v, setV] = useState<any>({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.from('ajustes').select('*').then(({ data, error }) => {
      if (error) return setMsg('Falta crear la tabla “ajustes”. Ejecuta el archivo supabase_extra.sql en Supabase.');
      const o: any = {}; (data ?? []).forEach((r: any) => (o[r.clave] = r.valor)); setV(o);
    });
  }, []);

  async function guardar() {
    const filas = CAMPOS.map(([clave]) => ({ clave, valor: v[clave] ?? '' }));
    const { error } = await supabase.from('ajustes').upsert(filas, { onConflict: 'clave' });
    setMsg(error ? 'Error: ' + error.message : 'Ajustes guardados.');
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Ajustes de tu congregación</h1>
      <p className="text-sm text-slate-600">Estos datos aparecen en la invitación mensual y en los PDF.</p>
      <div className={card + ' space-y-2'}>
        {CAMPOS.map(([k, label]) => (
          <label key={k} className="block text-sm">{label}
            <input className={inp} value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
          </label>
        ))}
        {msg && <p className="text-sm">{msg}</p>}
        <button className={btn} onClick={guardar}>Guardar ajustes</button>
      </div>
    </>
  );
}
