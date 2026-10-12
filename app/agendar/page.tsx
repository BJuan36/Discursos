'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getBosquejo, getOradoresPorBosquejo, bosquejoRepetido } from '@/lib/queries';
import { fmtFecha, inp, btn, card } from '@/lib/util';

const CANCELACIONES = [
  'NO HAY REUNIÓN - ASAMBLEA REGIONAL',
  'ASAMBLEA DE CIRCUITO',
  'SEMANA DE LA CONMEMORACIÓN',
];

function Regular() {
  const [fecha, setFecha] = useState('');
  const [numero, setNumero] = useState('');
  const [tema, setTema] = useState<any>(null);
  const [tipo, setTipo] = useState<'local' | 'visitante'>('local');
  const [oradores, setOradores] = useState<any[]>([]);
  const [oradorId, setOradorId] = useState('');
  const [alerta, setAlerta] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function buscar(t: 'local' | 'visitante' = tipo) {
    setError(''); setMsg(''); setAlerta([]); setOradorId('');
    const b = await getBosquejo(Number(numero));
    if (!b) { setTema(null); setOradores([]); return setError('Ese bosquejo no existe en el catálogo. Impórtalo en “Bosquejos”.'); }
    setTema(b);
    setOradores(await getOradoresPorBosquejo(b.numero, t));
    if (fecha) setAlerta(await bosquejoRepetido(b.numero, fecha));
  }

  async function guardar() {
    setError('');
    const { error } = await supabase.from('programa').insert({
      fecha, tipo_evento: 'regular', bosquejo_numero: tema.numero, titulo: tema.titulo, orador_id: oradorId,
    });
    if (error) return setError(error.message);
    setMsg(`Guardado: ${fmtFecha(fecha)} – bosquejo ${tema.numero}.`);
    setNumero(''); setTema(null); setOradores([]); setOradorId(''); setAlerta([]);
  }

  return (
    <div className={card + ' space-y-3'}>
      <h2 className="text-lg font-semibold">Discurso público regular</h2>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inp} />
      <div className="flex gap-2">
        <input type="number" placeholder="N.º de bosquejo" value={numero} onChange={(e) => setNumero(e.target.value)} className={inp} />
        <button className={btn} onClick={() => buscar()} disabled={!numero}>Buscar</button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {msg && <p className="text-green-700">{msg}</p>}
      {tema && <p className="font-medium">Bosquejo {tema.numero}: {tema.titulo}</p>}
      {alerta.length > 0 && (
        <div className="bg-amber-100 text-amber-900 p-2 rounded text-sm">
          ⚠ Este bosquejo ya está en el programa cerca de esa fecha:
          <ul className="list-disc ml-5">
            {alerta.map((a: any, i: number) => <li key={i}>{fmtFecha(a.fecha)} – {a.oradores?.nombre ?? ''}</li>)}
          </ul>
        </div>
      )}
      {tema && (
        <>
          <div className="flex gap-6">
            {(['local', 'visitante'] as const).map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input type="radio" checked={tipo === t} onChange={() => { setTipo(t); buscar(t); }} />
                {t === 'local' ? 'Local (L)' : 'Visitante (V)'}
              </label>
            ))}
          </div>
          {oradores.length === 0 && <p className="text-sm text-slate-600">Nadie de este grupo tiene preparado ese bosquejo.</p>}
          <select value={oradorId} onChange={(e) => setOradorId(e.target.value)} className={inp}>
            <option value="">Selecciona orador…</option>
            {oradores.map((o, i) => (
              <option key={o.id} value={o.id}>
                {i + 1}. {o.nombre}{o.congregaciones ? ` – ${o.congregaciones.nombre}` : ''}
              </option>
            ))}
          </select>
          <button className={btn} onClick={guardar} disabled={!oradorId || !fecha}>Guardar en el programa</button>
        </>
      )}
    </div>
  );
}

function Especial() {
  const [fecha, setFecha] = useState('');
  const [modo, setModo] = useState<'especial' | 'cancelacion'>('especial');
  const [titulo, setTitulo] = useState('');
  const [orador, setOrador] = useState('');
  const [cancel, setCancel] = useState(CANCELACIONES[0]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  async function guardar() {
    setError(''); setMsg('');
    const fila = modo === 'especial'
      ? { fecha, tipo_evento: 'especial', titulo, orador_libre: orador }
      : { fecha, tipo_evento: 'cancelacion', titulo: cancel };
    const { error } = await supabase.from('programa').insert(fila);
    if (error) return setError(error.message);
    setMsg(`Guardado: ${fmtFecha(fecha)}.`);
    setTitulo(''); setOrador('');
  }

  return (
    <div className={card + ' space-y-3'}>
      <h2 className="text-lg font-semibold">Eventos especiales y cancelaciones</h2>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inp} />
      <div className="flex gap-6">
        <label className="flex items-center gap-2"><input type="radio" checked={modo === 'especial'} onChange={() => setModo('especial')} />Discurso especial</label>
        <label className="flex items-center gap-2"><input type="radio" checked={modo === 'cancelacion'} onChange={() => setModo('cancelacion')} />Cancelación</label>
      </div>
      {modo === 'especial' ? (
        <>
          <input className={inp} placeholder="Título del discurso" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          <input className={inp} placeholder="Orador" value={orador} onChange={(e) => setOrador(e.target.value)} />
        </>
      ) : (
        <select className={inp} value={cancel} onChange={(e) => setCancel(e.target.value)}>
          {CANCELACIONES.map((c) => <option key={c}>{c}</option>)}
        </select>
      )}
      {error && <p className="text-red-600">{error}</p>}
      {msg && <p className="text-green-700">{msg}</p>}
      <button className={btn} onClick={guardar} disabled={!fecha || (modo === 'especial' && !titulo)}>Guardar</button>
    </div>
  );
}

export default function Agendar() {
  return (
    <>
      <h1 className="text-2xl font-bold">Agendar</h1>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <Regular />
        <Especial />
      </div>
    </>
  );
}
