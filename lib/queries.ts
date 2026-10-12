import { supabase } from './supabase';

// Valida que el bosquejo exista en el catálogo
export async function getBosquejo(numero: number) {
  const { data } = await supabase.from('bosquejos').select('*').eq('numero', numero).maybeSingle();
  return data;
}

// Oradores (local o visitante) que tienen preparado ese bosquejo
export async function getOradoresPorBosquejo(numero: number, tipo: 'local' | 'visitante') {
  const { data } = await supabase
    .from('oradores_bosquejos')
    .select('oradores!inner(id, nombre, telefono, tipo, congregaciones(nombre))')
    .eq('bosquejo_numero', numero)
    .eq('oradores.tipo', tipo);
  return (data ?? []).map((r: any) => r.oradores).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
}

// Alerta de repetición: ¿ese bosquejo está agendado cerca de la fecha (±6 meses)?
export async function bosquejoRepetido(numero: number, fecha: string, meses = 6) {
  const [y, m, d] = fecha.split('-').map(Number);
  const f = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  const desde = f(new Date(y, m - 1 - meses, d));
  const hasta = f(new Date(y, m - 1 + meses, d));
  const { data } = await supabase
    .from('programa').select('fecha, oradores(nombre)')
    .eq('bosquejo_numero', numero).gte('fecha', desde).lte('fecha', hasta).neq('fecha', fecha)
    .order('fecha');
  return data ?? [];
}
