'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { inp, btn } from '@/lib/util';

// Cada línea:  Nombre | teléfono | 1, 5, 12
export default function OradoresBulk({
  tipo, congregacionId = null, onDone,
}: { tipo: 'local' | 'visitante'; congregacionId?: string | null; onDone?: () => void }) {
  const [texto, setTexto] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function guardar() {
    setBusy(true); setMsg('');
    const { data: cat } = await supabase.from('bosquejos').select('numero');
    const existentes = new Set((cat ?? []).map((b: any) => b.numero));
    const ignorados = new Set<number>();
    let nOradores = 0;

    for (const linea of texto.split('\n').map((l) => l.trim()).filter(Boolean)) {
      const [nombre, tel = '', temas = ''] = linea.split('|').map((s) => s.trim());
      if (!nombre) continue;
      let q = supabase.from('oradores').select('id').eq('nombre', nombre).eq('tipo', tipo);
      q = congregacionId ? q.eq('congregacion_id', congregacionId) : q.is('congregacion_id', null);
      let { data: ex } = await q.maybeSingle();
      let id = ex?.id;
      if (!id) {
        const { data: nuevo, error } = await supabase.from('oradores')
          .insert({ nombre, tipo, telefono: tel || null, congregacion_id: congregacionId })
          .select('id').single();
        if (error) { setMsg('Error: ' + error.message); setBusy(false); return; }
        id = nuevo.id;
      } else if (tel) {
        await supabase.from('oradores').update({ telefono: tel }).eq('id', id);
      }
      nOradores++;
      const nums = temas.split(/[,;\s]+/).map(Number).filter((n) => n > 0);
      const validos = nums.filter((n) => existentes.has(n));
      nums.filter((n) => !existentes.has(n)).forEach((n) => ignorados.add(n));
      if (validos.length)
        await supabase.from('oradores_bosquejos')
          .upsert(validos.map((n) => ({ orador_id: id, bosquejo_numero: n })), { onConflict: 'orador_id,bosquejo_numero' });
    }
    setMsg(`Listo: ${nOradores} orador(es) procesados.` +
      (ignorados.size ? ` Bosquejos que no están en el catálogo y se omitieron: ${[...ignorados].join(', ')}.` : ''));
    setTexto(''); setBusy(false); onDone?.();
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600">
        Una línea por orador, con este formato: <code>Nombre | teléfono | 1, 5, 12</code>. Si ya existe, se le agregan los temas nuevos.
      </p>
      <textarea className={inp + ' h-32 font-mono text-sm'} value={texto} onChange={(e) => setTexto(e.target.value)}
        placeholder={'Juan Pérez | 5555-1234 | 3, 7, 21\nLuis Gómez | | 12, 40'} />
      {msg && <p className="text-sm">{msg}</p>}
      <button className={btn} onClick={guardar} disabled={busy || !texto.trim()}>{busy ? 'Guardando…' : 'Registrar oradores'}</button>
    </div>
  );
}
