# SIGP.Med

Prototipo de gestión de consultas y mediciones clínicas preparado para pruebas iniciales sin backend. Todos los pacientes incluidos son ficticios.

## Ejecutar localmente

Requiere Node.js 22 o una versión LTS compatible.

```bash
npm ci
npm run dev
```

El modo predeterminado es `demo`: la aplicación carga `public/data/db.json` la primera vez y guarda los cambios en `localStorage`. Cada navegador tiene su propia copia independiente.

## Casos de prueba incluidos

| DNI ficticio | Escenario |
| --- | --- |
| `40111222` | Paciente con evolución de peso normal |
| `38999888` | Paciente con un cambio de peso superior al 20 % |
| `42123456` | Paciente con consulta pero sin mediciones |

La barra de modo demostración incluye un botón **Restablecer datos** para eliminar los cambios locales y volver a cargar estos casos.

## Estructura de datos

La base inicial se encuentra en `public/data/db.json` y contiene cuatro colecciones:

- `medicos`
- `pacientes`
- `consultas`
- `mediciones`

`src/services/mockRepository.ts` implementa las altas y búsquedas sobre esa base. `src/services/dataRepository.ts` elige el origen de datos y mantiene a los componentes desacoplados del almacenamiento.

No deben agregarse datos personales o médicos reales: el JSON y el código desplegados en GitHub Pages son públicos, y `localStorage` no es una base segura.

## Volver a utilizar el backend

La implementación HTTP existente está encapsulada en `src/services/apiRepository.ts`. Crear un archivo `.env.local` con:

```env
VITE_DATA_MODE=api
VITE_API_URL=http://localhost:8000/api
```

Para regresar a la demostración, usar `VITE_DATA_MODE=demo` o eliminar `.env.local`.

## Publicar en GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` compila y publica el proyecto automáticamente cuando se hace push a `main`. La ruta base se obtiene del nombre del repositorio, por lo que funciona en URLs del tipo `https://usuario.github.io/repositorio/` sin editar `vite.config.ts`.

Si la carpeta todavía no es un repositorio Git:

```bash
git init
git branch -M main
git add .
git commit -m "Preparar demo para GitHub Pages"
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

Después, en GitHub:

1. Abrir **Settings → Pages**.
2. En **Build and deployment**, seleccionar **GitHub Actions** como origen.
3. Abrir la pestaña **Actions** y esperar que finalice `Deploy SIGP.Med to GitHub Pages`.
4. La URL publicada aparecerá tanto en el workflow como en **Settings → Pages**.

## Verificación

```bash
npm run lint
npm run build
npm run preview
```

`npm run preview` sirve únicamente para revisar localmente la compilación de producción.
