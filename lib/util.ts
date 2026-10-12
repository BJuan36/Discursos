export const inp = 'w-full border border-slate-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600';
export const btn = 'px-4 py-2 rounded-md bg-teal-700 text-white font-medium hover:bg-teal-800 disabled:opacity-40';
export const btn2 = 'px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-100 text-sm';
export const card = 'bg-white border border-slate-200 rounded-lg p-4 shadow-sm';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function fmtFecha(f: string) {
  if (!f) return '';
  const [y, m, d] = f.split('-').map(Number);
  const dia = DIAS[new Date(y, m - 1, d).getDay()];
  return `${dia} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

export function hoyISO() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`;
}

// 'YYYY-MM' -> [primer día del mes, primer día del mes siguiente]
export function rangoMes(mes: string): [string, string] {
  const [y, m] = mes.split('-').map(Number);
  const sig = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
  return [`${y}-${String(m).padStart(2, '0')}-01`, sig];
}

export function nombreMes(mes: string) {
  const M = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const [y, m] = mes.split('-').map(Number);
  return `${M[m - 1]} de ${y}`;
}
