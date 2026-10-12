'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fmtFecha, hoyISO, btn2, card } from '@/lib/util';

export default function Programa() {
  const [filas, setFilas] = useState<any[]>([]);
  const [pasados, setPasados] = useState(false);

  async function cargar() {
    let q = supabase
      .from('programa')
      .select('*, oradores(nombre, tipo, telefono, congregaciones(nombre))')
      .order('fecha');
    if (!pasados) q = q.gte('fecha', hoyISO());
    const { data } = await q;
    setFilas(data ?? []);
  }
  useEffect(() => { cargar(); }, [pasados]);

  async function borrar(id: string) {
    if (!confirm('¿Eliminar esta asignación?')) return;
    await supabase.from('programa').delete().eq('id', id);
    cargar();
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Programa de discursos</h1>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={pasados} onChange={(e) => setPasados(e.target.checked)} />
          Mostrar domingos pasados
        </label>
      </div>
      {filas.length === 0 && <p className={card}>No hay asignaciones. Ve a “Agendar” para crear la primera.</p>}
      <div className="space-y-2">
        {filas.map((f) => {
          const cancel = f.tipo_evento === 'cancelacion';
          const orador = f.oradores?.nombre ?? f.orador_libre ?? '';
          const color = cancel ? 'border-red-300 bg-red-50' : f.oradores?.tipo === 'local' ? 'border-teal-300 bg-teal-50' : f.tipo_evento === 'especial' ? 'border-violet-300 bg-violet-50' : 'border-amber-300 bg-amber-50';
          return (
            <div key={f.id} className={`border rounded-lg p-3 flex gap-3 items-start ${color}`}>
              <div className="flex-1">
                <div className="font-semibold">{fmtFecha(f.fecha)}</div>
                <div>{f.bosquejo_numero ? `${f.bosquejo_numero}. ` : ''}{f.titulo}</div>
                {!cancel && (
                  <div className="text-sm text-slate-700">
                    {orador}
                    {f.oradores?.tipo === 'visitante' && ` – ${f.oradores?.congregaciones?.nombre ?? ''}`}
                    {f.oradores?.telefono && ` · Tel. ${f.oradores.telefono}`}
                    {f.oradores?.tipo && <span className="ml-2 text-xs">({f.oradores.tipo === 'local' ? 'Local' : 'Visitante'})</span>}
                  </div>
                )}
              </div>
              <button className={btn2} onClick={() => borrar(f.id)}>Eliminar</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
