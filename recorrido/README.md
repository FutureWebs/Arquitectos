# Recorrido 3D — template de complejos

Template reutilizable de recorrido 3D para complejos de canchas / cabañas.
Angular 19 (standalone + signals), Material, Vite.

## Flujo de la experiencia

1. **Pantalla inicial** — SVG estático del complejo + botón *Empezar*.
2. **Video de acercamiento** — `intro.video` lleva a la primera parada.
3. **Exterior** — paradas (A/B/C…) navegables con flechas ← → e indicadores.
4. **Entrar** — hotspot sobre el edificio → video de entrada → escena interior.
5. **Modal** — botón superior izquierdo → ventana centrada con tabs
   (Info / Galería / Planos / 3D).
6. **Volver** — videos inversos (interior → parada → exterior → inicio).

---

## Checklist: qué archivos se cambian por proyecto

Solo se tocan **4 cosas**. Todo lo demás es el motor y no se modifica.

| # | Qué cambia | Archivo / carpeta |
|---|------------|-------------------|
| 1 | **Data** (textos, paradas, videos, edificios, tabs) | `src/app/data/data.environment.ts` |
| 2 | **Estilos** (colores, tipografía, tamaños) | `src/variables.css` |
| 3 | **Assets** (SVG, fotos, videos, planos) | `public/mobile/` y `public/desktop/` |
| 4 | **Ficha del sitio** (favicon, título, base-href) | `public/favicon.ico`, `src/index.html`, `.github/workflows/deploy.yml` |

### Lo que NO se toca

`src/app/models/`, `src/app/services/`, `src/app/componentes/`, `src/styles.css`,
`src/app/app.*`, `angular.json`, `package.json`.
Si necesitás un comportamiento nuevo, se agrega genérico leyendo de `data.environment.ts`.

---

### 1. Data → `src/app/data/data.environment.ts`

Único archivo con textos y configuración:

| Sección    | Qué controla |
|------------|--------------|
| `project`  | `name` → título de la pestaña del navegador |
| `ui`       | todos los textos de la interfaz (`hero` es el texto de portada, más botones, tooltips y tabs) |
| `media`    | `roots.mobile` / `roots.desktop` y `defaultDevice` |
| `start`    | arte de la pantalla inicial (`image` + `fallbackImage`) |
| `tour`     | `startStop`, `loop`, `stops[]`, `transitions{}`, `intro`, `outro` |
| `buildings[]` | edificios/cabañas: `entryStop`, videos, hotspot, contenido del modal |
| `tabs[]`   | pestañas del modal (`id`, `label`, `icon` de Material) |

- **Transiciones**: clave `"A>B"` → video de A a B. Debe existir el par inverso
  (`"B>A"`) para poder volver. Con `loop: true` el último enlace cierra el circuito.
- **Otra cabaña**: copiar el bloque de `cabana-1`, cambiar `id`, `entryStop`,
  videos, poster interior y las coordenadas del hotspot.
- **Hotspot**: `{ x, y }` en % del poster de esa parada, con variantes
  `mobile` y `desktop`. Hay que reajustarlo cada vez que cambian las fotos
  de las paradas.

---

### 2. Estilos → `src/variables.css`

Todos los tokens (colores, tipografía, radios, sombras, z-index) están ahí.
Los tamaños mobile viven en el bloque `@media (max-width: 768px)` del final,
con el sufijo `-mobile` (ej. `--btn-size-mobile`). Cada componente solo
consume tokens dentro de sus propios `@media`.

Para re-teñir todo el template alcanza con cambiar `--color-accent`,
`--color-badge-*` y `--stage-bg`.

---

### 3. Assets → `public/mobile/` y `public/desktop/`

**Clave de data ↔ archivo real** (las claves son relativas a `public/<raíz>/`):

#### Imágenes de la pantalla inicial

| Clave en data | Archivo | Formato |
|---------------|---------|---------|
| `start.image` | `public/mobile/inicio/complejo.svg` | **SVG** (placeholder ilustrado del complejo) |
| `start.fallbackImage` | `public/mobile/tour/fotos/inicio.webp` | WebP — se usa si el SVG falla / como foto de respaldo |

> El SVG es el plano del complejo que se ve antes de *Empezar*. Va dibujado a
> escala, con la misma proporción de las fotos de las paradas, y debe traer
> **los marcadores A/B/C incluidos** (círculo blanco + letra) en las mismas
> posiciones que después aparecen en el recorrido. ViewBox recomendado:
> `0 0 1200 720`.

#### Fotos de las paradas (exteriores)

| Clave en data | Archivo |
|---------------|---------|
| `tour.stops[0].poster` (A) | `public/mobile/tour/fotos/parada-a.webp` |
| `tour.stops[1].poster` (B) | `public/mobile/tour/fotos/parada-b.webp` |
| `tour.stops[2].poster` (C) | `public/mobile/tour/fotos/parada-c.webp` |

Agregando una parada `D` en `tour.stops[]` se agrega
`public/mobile/tour/fotos/parada-d.webp` (y su label).

#### Videos del recorrido

| Clave en data | Archivo | Qué hace |
|---------------|---------|----------|
| `tour.intro.video` | `public/mobile/tour/videos/inicio-a.mp4` | acercamiento inicial → parada A |
| `tour.outro.video` | `public/mobile/tour/videos/a-inicio.mp4` | salida → pantalla inicial |
| `tour.transitions['A>B']` | `public/mobile/tour/videos/a-b.mp4` | A → B |
| `tour.transitions['B>A']` | `public/mobile/tour/videos/b-a.mp4` | B → A |
| `tour.transitions['A>C']` | `public/mobile/tour/videos/a-c.mp4` | A → C |
| `tour.transitions['C>A']` | `public/mobile/tour/videos/c-a.mp4` | C → A |
| `tour.transitions['B>C']` | `public/mobile/tour/videos/b-c.mp4` | B → C |
| `tour.transitions['C>B']` | `public/mobile/tour/videos/c-b.mp4` | C → B |
| `buildings[].insideVideo` | `public/mobile/tour/videos/a-interior.mp4` | parada A → interior |
| `buildings[].exitVideo` | `public/mobile/tour/videos/interior-a.mp4` | interior → parada A |

MP4 H.264, sin audio, 1080p, duración 2–4 s, `autoplay muted playsinline`.
Los nombres de archivo son libres: se listan tal cual en `data.environment.ts`.

#### Assets de cada cabaña / edificio (`buildings[].id` = `cabana-1`)

| Clave en data | Archivo |
|---------------|---------|
| `interiorPoster` | `public/mobile/edificios/cabana-1/interior.webp` |
| `content.gallery[]` | `public/mobile/edificios/cabana-1/galeria/01..04.webp` |
| `content.plans[].image` | `public/mobile/edificios/cabana-1/plano.webp` |
| `content.tour3d.url` | URL externa (no es archivo local) |

#### Desktop

Hoy `media.roots.desktop` está en `'mobile'` (placeholder): desktop usa los
mismos archivos. Cuando exista `public/desktop/...` con las mismas rutas,
cambiar a `'desktop'`. Si un archivo no existe en la raíz activa, los
componentes caen solos al fallback de mobile (no se rompe nada).

**Nota**: los archivos de `public/` se copian tal cual al build — nombres en
minúsculas, sin espacios, sin tildes.

---

### 4. Ficha del sitio

| Archivo | Qué cambia |
|---------|------------|
| `public/favicon.ico` | ícono del navegador |
| `src/index.html` | `<title>` (luego lo pisa `project.name`), `<html lang>`, fuentes |
| `.github/workflows/deploy.yml` | `--base-href` del build. Hoy es `"/visualizer-beta/"`; poner `"/nombre-del-repo/"` |
| `.github/workflows/deploy.yml` (path) | el artefacto sale de `./recorrido/dist/visualizer-beta/browser` |

---

## Estructura

```
recorrido/
├─ src/
│  ├─ variables.css            ← tokens de estilo CENTRALES
│  ├─ styles.css               ← reset/base (no se toca)
│  └─ app/
│     ├─ data/data.environment.ts   ← datos CENTRALES
│     ├─ models/                    ← interfaces tipadas
│     ├─ services/
│     │   ├─ media.service.ts       ← resuelve assets por dispositivo
│     │   └─ tour-state.service.ts  ← máquina de estados + cola de videos
│     └─ componentes/
│         ├─ tour-shell/        orquestador
│         ├─ media-stage/       poster + video + capa de UI
│         ├─ start-screen/      pantalla inicial
│         ├─ nav-controls/      flechas ← →
│         ├─ stop-indicators/   píldoras A·B·C
│         ├─ enter-hotspot/     botón "Entrar"
│         ├─ info-modal/        modal con tabs
│         └─ tabs/{informacion,galeria-imagenes,planos,recorrido-3d}/
└─ public/
   ├─ mobile/{inicio,tour/fotos,tour/videos,edificios/...}
   └─ desktop/                 ← aún vacío (placeholder)
```

## Comandos

```bash
npm install
npm start -- --host 127.0.0.1 --port 4200   # dev server
npm run build                                # build producción
npm run test -- --watch=false --browsers=ChromeHeadless
```

## Reglas del código

- **Cero `*ngIf` / `*ngFor`**: usar `@if` / `@for` / `@switch` (validado con grep).
- `tsconfig` en `strict` + `noPropertyAccessFromIndexSignature`: en registros
  tipados (`Record<string, X>`) acceder con corchetes, no con punto.
- Breakpoint mobile: `768px`. El servicio de media considera *desktop* desde
  `min-width: 769px` y reacciona en vivo al redimensionar.
- Los textos visibles salen de `DATA_ENVIRONMENT.ui`; no hardcodearlos en HTML.
