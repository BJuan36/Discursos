# Discursos públicos

App web para coordinar el programa de discursos públicos.

## Pasos de instalación

1. **Supabase**: ya creaste las tablas. Ejecuta además `supabase_extra.sql` (SQL Editor → New query → Run → "Run and enable RLS").
2. **Crear tu usuario**: en Supabase, menú **Authentication → Users → Add user → Create new user**. Escribe un correo y una contraseña, y marca "Auto Confirm User". Con ese correo entrarás a la app. Crea uno por cada coordinador.
3. **GitHub**: crea un repositorio nuevo y sube TODOS los archivos de esta carpeta (contenido de la carpeta, no la carpeta misma).
4. **Vercel**: Add New → Project → elige el repositorio. Antes de Deploy, abre *Environment Variables* y agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` = tu Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu clave publishable (o anon)
5. Pulsa **Deploy**.

## Primer uso (orden recomendado)

1. **Ajustes**: datos de tu congregación.
2. **Bosquejos → Importar catálogo**: pega la lista de bosquejos (`1 | Título`).
3. **Bosquejos → Registrar hermanos locales**: `Nombre | teléfono | 1, 5, 12`.
4. **Congregaciones**: registra congregaciones y sus oradores visitantes.
5. **Agendar**: empieza a llenar el programa.
