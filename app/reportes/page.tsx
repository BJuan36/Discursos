'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { rangoMes, nombreMes, btn, card, inp } from '@/lib/util';

async function descargar(doc: any, nombre: string) {
  const { pdf } = await import('@react-pdf/renderer');
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre; a.click();
  URL.revokeObjectURL(url);
}

async function getAjustes() {
  const { data } = await supabase.from('ajustes').select('*');
  const o: any = {}; (data ?? []).forEach((r: any) => (o[r.clave] = r.valor)); return o;
}

export default function Reportes() {
  const hoy = new Date();
  const [mes, setMes] = useState(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');

  async function run(nombre: string, fn: () => Promise<void>) {
    setBusy(nombre); setMsg('');
    try { await fn(); } catch (e: any) { setMsg('Error: ' + (e?.message ?? e)); }
    setBusy('');
  }

  const programaMes = async () => {
    const [d, h] = rangoMes(mes);
    const { data } = await supabase.from('programa')
      .select('*, oradores(nombre, tipo, congregaciones(nombre))').gte('fecha', d).lt('fecha', h).order('fecha');
    return data ?? [];
  };

  const bProgramaGeneral = () => run('prog', async () => {
    const { ProgramaPDF } = await import('@/components/pdf/Docs');
    await descargar(<ProgramaPDF mes={mes} filas={await programaMes()} ajustes={await getAjustes()} />, `programa-${mes}.pdf`);
  });

  const bInvitacion = () => run('inv', async () => {
    const { InvitacionPDF } = await import('@/components/pdf/Docs');
    const filas = (await programaMes()).filter((f: any) => f.oradores?.tipo === 'visitante');
    const mapa: any = {};
    filas.forEach((f: any) => {
      const c = f.oradores?.congregaciones?.nombre ?? 'Sin congregación';
      (mapa[c] = mapa[c] ?? []).push(f);
    });
    const grupos = Object.keys(mapa).sort().map((c) => ({ congregacion: c, filas: mapa[c] }));
    await descargar(<InvitacionPDF mes={mes} grupos={grupos} ajustes={await getAjustes()} />, `invitaciones-${mes}.pdf`);
  });

  const bBosquejos = () => run('bosq', async () => {
    const { BosquejosLocalesPDF } = await import('@/components/pdf/Docs');
    const { data } = await supabase.from('oradores')
      .select('id, nombre, oradores_bosquejos(bosquejo_numero, bosquejos(titulo))').eq('tipo', 'local').order('nombre');
    const oradores = (data ?? []).map((o: any) => ({
      id: o.id, nombre: o.nombre,
      temas: o.oradores_bosquejos.map((x: any) => ({ numero: x.bosquejo_numero, titulo: x.bosquejos?.titulo })).sort((a: any, b: any) => a.numero - b.numero),
    }));
    await descargar(<BosquejosLocalesPDF oradores={oradores} ajustes={await getAjustes()} />, 'bosquejos-locales.pdf');
  });

  const bSalientes = (todo: boolean) => run(todo ? 'saltodo' : 'salmes', async () => {
    const { SalientesPDF } = await import('@/components/pdf/Docs');
    let q = supabase.from('salientes')
      .select('*, oradores(nombre), bosquejos(titulo), congregaciones(nombre, direccion, dia_reunion, horario)').order('fecha');
    if (!todo) { const [d, h] = rangoMes(mes); q = q.gte('fecha', d).lt('fecha', h); }
    const { data } = await q;
    await descargar(<SalientesPDF titulo={todo ? 'Listado completo' : nombreMes(mes)} filas={data ?? []} ajustes={await getAjustes()} />, todo ? 'salientes-completo.pdf' : `salientes-${mes}.pdf`);
  });

  const B = ({ id, onClick, children }: any) => (
    <button className={btn + ' w-full text-left'} onClick={onClick} disabled={!!busy}>{busy === id ? 'Generando…' : children}</button>
  );

  return (
    <>
      <h1 className="text-2xl font-bold">Reportes en PDF</h1>
      <div className={card + ' space-y-3'}>
        <label className="block text-sm">Mes para los reportes mensuales
          <input type="month" className={inp + ' max-w-xs'} value={mes} onChange={(e) => setMes(e.target.value)} />
        </label>
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <div className="grid sm:grid-cols-2 gap-2">
          <B id="prog" onClick={bProgramaGeneral}>Programa general del mes</B>
          <B id="inv" onClick={bInvitacion}>Invitación a congregaciones (mes)</B>
          <B id="bosq" onClick={bBosquejos}>Bosquejos de oradores locales</B>
          <B id="salmes" onClick={() => bSalientes(false)}>Salientes del mes</B>
          <B id="saltodo" onClick={() => bSalientes(true)}>Salientes: listado completo</B>
        </div>
      </div>
    </>
  );
}
