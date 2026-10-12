'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getBosquejo, getOradoresPorBosquejo } from '@/lib/queries';
import OradoresBulk from '@/components/OradoresBulk';
import { inp, btn, card } from '@/lib/util';

export default function Bosquejos() {
  const [num, setNum] = useState('');
  const [res, setRes] = useState<any>(null);
  const [locales, setLocales] = useState<any[]>([]);
  const [bosq, setBosq] = useState<any[]>([]);
  const [rel, setRel] = useState<Set<string>>(new Set());
  const [cat, setCat] = useState('');
  const [msgCat, setMsgCat] = useState('');

  async function cargar() {
    const [{ data: o }, { data: b }, { data: r }] = await Promise.all([
      supabase.from('oradores').select('id, nombre').eq('tipo', 'local').order('nombre'),
      supabase.from('bosquejos').select('*').order('numero'),
      supabase.from('oradores_bosquejos').select('orador_id, bosquejo_numero'),
    ]);
    setLocales(o ?? []); setBosq(b ?? []);
    setRel(new Set((r ?? []).map((x: any) => `${x.orador_id}|${x.bosquejo_numero}`)));
  }
  useEffect(() => { cargar(); }, []);

  async function buscar() {
    const b = await getBosquejo(Number(num));
    if (!b) return setRes({ vacio: true });
    setRes({ b, locales: await getOradoresPorBosquejo(b.numero, 'local'), visitantes: await getOradoresPorBosquejo(b.numero, 'visitante') });
  }

  async function toggle(oradorId: string, n: number) {
    const k = `${oradorId}|${n}`;
    if (rel.has(k)) await supabase.from('oradores_bosquejos').delete().eq('orador_id', oradorId).eq('bosquejo_numero', n);
    else await supabase.from('oradores_bosquejos').insert({ orador_id: oradorId, bosquejo_numero: n });
    const s = new Set(rel); rel.has(k) ? s.delete(k) : s.add(k); setRel(s);
  }

  async function importar() {
    const filas = cat.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
      const m = l.match(/^(\d+)\s*[|.\-–:)]*\s*(.+)$/);
      return m ? { numero: Number(m[1]), titulo: m[2].trim() } : null;
    }).filter(Boolean);
    const { error } = await supabase.from('bosquejos').upsert(filas as any[], { onConflict: 'numero' });
    setMsgCat(error ? 'Error: ' + error.message : `Se guardaron ${filas.length} bosquejos.`);
    if (!error) { setCat(''); cargar(); }
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Bosquejos</h1>

      <section className={card + ' space-y-2'}>
        <h2 className="font-semibold">Buscar por número de bosquejo</h2>
        <div className="flex gap-2">
          <input type="number" className={inp} placeholder="N.º" value={num} onChange={(e) => setNum(e.target.value)} />
          <button className={btn} onClick={buscar} disabled={!num}>Buscar</button>
        </div>
        {res?.vacio && <p className="text-red-600">Ese bosquejo no está en el catálogo.</p>}
        {res?.b && (
          <div className="text-sm space-y-1">
            <p className="font-medium">{res.b.numero}. {res.b.titulo}</p>
            <p><strong>Locales:</strong> {res.locales.length ? res.locales.map((o: any) => o.nombre).join(', ') : 'nadie lo tiene preparado'}</p>
            <p><strong>Visitantes:</strong> {res.visitantes.length ? res.visitantes.map((o: any) => `${o.nombre} (${o.congregaciones?.nombre ?? ''})`).join(', ') : 'ninguno'}</p>
          </div>
        )}
      </section>

      <section className={card + ' space-y-2'}>
        <h2 className="font-semibold">Matriz de hermanos locales</h2>
        <p className="text-sm text-slate-600">Toca una celda para marcar o quitar la “X”.</p>
        {locales.length === 0 || bosq.length === 0 ? (
          <p className="text-sm">Primero registra hermanos locales y el catálogo (abajo).</p>
        ) : (
          <div className="overflow-auto max-h-[60vh] border rounded">
            <table className="text-sm border-collapse">
              <thead className="sticky top-0 bg-slate-100">
                <tr>
                  <th className="p-1 border text-left sticky left-0 bg-slate-100">N.º y tema</th>
                  {locales.map((o) => <th key={o.id} className="p-1 border whitespace-nowrap">{o.nombre}</th>)}
                </tr>
              </thead>
              <tbody>
                {bosq.map((b) => (
                  <tr key={b.numero}>
                    <td className="p-1 border sticky left-0 bg-white whitespace-nowrap max-w-xs overflow-hidden text-ellipsis">{b.numero}. {b.titulo}</td>
                    {locales.map((o) => (
                      <td key={o.id} onClick={() => toggle(o.id, b.numero)} className="p-1 border text-center cursor-pointer hover:bg-teal-100">
                        {rel.has(`${o.id}|${b.numero}`) ? 'X' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={card + ' space-y-2'}>
        <h2 className="font-semibold">Registrar hermanos locales y sus bosquejos</h2>
        <OradoresBulk tipo="local" onDone={cargar} />
      </section>

      <section className={card + ' space-y-2'}>
        <h2 className="font-semibold">Importar catálogo de bosquejos</h2>
        <p className="text-sm text-slate-600">Una línea por bosquejo: <code>1 | Título del discurso</code>. Puedes pegar la lista completa.</p>
        <textarea className={inp + ' h-32 font-mono text-sm'} value={cat} onChange={(e) => setCat(e.target.value)} />
        {msgCat && <p className="text-sm">{msgCat}</p>}
        <button className={btn} onClick={importar} disabled={!cat.trim()}>Guardar catálogo</button>
      </section>
    </>
  );
}
