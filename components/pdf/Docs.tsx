import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { fmtFecha, nombreMes } from '@/lib/util';

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 10.5, fontFamily: 'Helvetica' },
  titulo: { fontSize: 16, textAlign: 'center', marginBottom: 4, fontFamily: 'Helvetica-Bold' },
  sub: { fontSize: 11, textAlign: 'center', marginBottom: 14, color: '#475569' },
  head: { flexDirection: 'row', backgroundColor: '#0f766e', color: '#fff', paddingVertical: 4, paddingHorizontal: 4, fontFamily: 'Helvetica-Bold' },
  fila: { flexDirection: 'row', borderBottom: '0.5pt solid #cbd5e1', paddingVertical: 4, paddingHorizontal: 4 },
  local: { backgroundColor: '#e6f4f1' },
  visitante: { backgroundColor: '#fff4dc' },
  cancel: { backgroundColor: '#fde8e8' },
  p: { marginBottom: 8, lineHeight: 1.4 },
  b: { fontFamily: 'Helvetica-Bold' },
  caja: { marginTop: 14, padding: 8, border: '0.5pt solid #94a3b8' },
  leyenda: { flexDirection: 'row', gap: 12, marginTop: 10, fontSize: 9 },
});

const W = (w: string) => ({ width: w });

// ---------- Programa general mensual ----------
export const ProgramaPDF = ({ mes, filas, ajustes }: any) => (
  <Document>
    <Page size="LETTER" style={s.page}>
      <Text style={s.titulo}>Programa de discursos públicos</Text>
      <Text style={s.sub}>{ajustes?.congregacion ? `${ajustes.congregacion} – ` : ''}{nombreMes(mes)}</Text>
      <View style={s.head}>
        <Text style={W('22%')}>Fecha</Text><Text style={W('40%')}>Bosquejo / tema</Text><Text style={W('38%')}>Orador</Text>
      </View>
      {filas.map((f: any) => {
        const cancel = f.tipo_evento === 'cancelacion';
        const tipo = f.oradores?.tipo;
        const estilo = cancel ? s.cancel : tipo === 'local' ? s.local : tipo === 'visitante' ? s.visitante : {};
        const orador = f.oradores?.nombre ?? f.orador_libre ?? '';
        return (
          <View key={f.id} style={[s.fila, estilo]} wrap={false}>
            <Text style={W('22%')}>{fmtFecha(f.fecha)}</Text>
            <Text style={W('40%')}>{f.bosquejo_numero ? `${f.bosquejo_numero}. ` : ''}{f.titulo}</Text>
            <Text style={W('38%')}>{cancel ? '' : orador}{tipo === 'visitante' && f.oradores?.congregaciones?.nombre ? ` (${f.oradores.congregaciones.nombre})` : ''}</Text>
          </View>
        );
      })}
      <View style={s.leyenda}>
        <Text>Azul verdoso: orador local</Text><Text>Amarillo: orador visitante</Text><Text>Rojo: sin reunión</Text>
      </View>
    </Page>
  </Document>
);

// ---------- Bosquejos preparados por oradores locales ----------
export const BosquejosLocalesPDF = ({ oradores, ajustes }: any) => (
  <Document>
    <Page size="LETTER" style={s.page}>
      <Text style={s.titulo}>Bosquejos preparados por oradores locales</Text>
      <Text style={s.sub}>{ajustes?.congregacion ?? ''}</Text>
      {oradores.map((o: any) => (
        <View key={o.id} style={{ marginBottom: 10 }} wrap={false}>
          <Text style={[s.b, { fontSize: 12, marginBottom: 2 }]}>{o.nombre}</Text>
          {o.temas.length === 0 && <Text>Sin bosquejos registrados.</Text>}
          {o.temas.map((t: any) => <Text key={t.numero}>{t.numero}. {t.titulo}</Text>)}
        </View>
      ))}
    </Page>
  </Document>
);

// ---------- Invitación mensual a otras congregaciones ----------
export const InvitacionPDF = ({ mes, grupos, ajustes }: any) => (
  <Document>
    {grupos.map((g: any) => (
      <Page key={g.congregacion} size="LETTER" style={s.page}>
        <Text style={s.titulo}>Invitación – Discursos públicos</Text>
        <Text style={s.sub}>{nombreMes(mes)}</Text>
        <Text style={s.p}>Estimados hermanos de la congregación <Text style={s.b}>{g.congregacion}</Text>:</Text>
        <Text style={s.p}>
          Con mucho gusto recibiremos en nuestro Salón del Reino a los hermanos que se indican abajo para presentar el discurso público.
          Agradecemos de antemano su amor y su disposición.
        </Text>
        <View style={s.head}>
          <Text style={W('24%')}>Fecha</Text><Text style={W('46%')}>Tema</Text><Text style={W('30%')}>Orador</Text>
        </View>
        {g.filas.map((f: any) => (
          <View key={f.id} style={s.fila} wrap={false}>
            <Text style={W('24%')}>{fmtFecha(f.fecha)}</Text>
            <Text style={W('46%')}>{f.bosquejo_numero}. {f.titulo}</Text>
            <Text style={W('30%')}>{f.oradores?.nombre}</Text>
          </View>
        ))}
        <View style={s.caja} wrap={false}>
          <Text style={s.b}>Salón del Reino{ajustes?.congregacion ? ` – ${ajustes.congregacion}` : ''}</Text>
          {ajustes?.direccion_salon ? <Text>Dirección: {ajustes.direccion_salon}</Text> : null}
          {ajustes?.horario ? <Text>Reunión: {ajustes.horario}</Text> : null}
          {ajustes?.encargado ? <Text>Encargado(s): {ajustes.encargado}{ajustes?.telefono_encargado ? ` – Tel. ${ajustes.telefono_encargado}` : ''}</Text> : null}
        </View>
        <Text style={[s.p, { marginTop: 14 }]}>Su hermano(s) en el servicio a Jehová.</Text>
      </Page>
    ))}
    {grupos.length === 0 && (
      <Page size="LETTER" style={s.page}><Text>No hay oradores visitantes programados en {nombreMes(mes)}.</Text></Page>
    )}
  </Document>
);

// ---------- Plantilla de oradores salientes ----------
export const SalientesPDF = ({ titulo, filas, ajustes }: any) => (
  <Document>
    <Page size="LETTER" orientation="landscape" style={s.page}>
      <Text style={s.titulo}>Oradores salientes</Text>
      <Text style={s.sub}>{ajustes?.congregacion ? `${ajustes.congregacion} – ` : ''}{titulo}</Text>
      <View style={s.head}>
        <Text style={W('14%')}>Fecha</Text><Text style={W('18%')}>Orador</Text><Text style={W('28%')}>Tema</Text>
        <Text style={W('20%')}>Congregación</Text><Text style={W('20%')}>Dirección y horario</Text>
      </View>
      {filas.map((x: any) => (
        <View key={x.id} style={s.fila} wrap={false}>
          <Text style={W('14%')}>{fmtFecha(x.fecha)}</Text>
          <Text style={W('18%')}>{x.oradores?.nombre}</Text>
          <Text style={W('28%')}>{x.bosquejo_numero}. {x.bosquejos?.titulo}</Text>
          <Text style={W('20%')}>{x.congregaciones?.nombre}{x.telefono ? `\nTel. ${x.telefono}` : ''}</Text>
          <Text style={W('20%')}>{x.congregaciones?.direccion}{'\n'}{[x.congregaciones?.dia_reunion, x.congregaciones?.horario].filter(Boolean).join(' ')}</Text>
        </View>
      ))}
    </Page>
  </Document>
);
