import { DataEnvironment } from '../models/environment.models';

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  ARCHIVO CENTRAL DE DATOS DEL PROYECTO
 * ══════════════════════════════════════════════════════════════════════════
 *  Todo lo que cambia entre un proyecto y otro vive acá:
 *   · textos            -> ui / project
 *   · rutas de assets   -> media.roots + todas las claves tipo 'tour/fotos/...'
 *   · recorrido         -> tour (paradas, transiciones, intro/outro)
 *   · edificios/cabañas -> buildings (hotspots, videos, contenido del modal)
 *   · pestañas          -> tabs
 *
 *  Para cambiar de proyecto: reemplazá este archivo, los archivos de
 *  `variables.css` y los que haya en `public/<dispositivo>/`.
 * ══════════════════════════════════════════════════════════════════════════
 */

export const DATA_ENVIRONMENT: DataEnvironment = {
  project: {
    name: 'Recorrido 3D',
  },

  ui: {
    loading: 'Cargando experiencia 3D...',
    hero: 'Bienvenido a tu nuevo espacio',
    start: 'Empezar',
    back: 'Volver',
    enter: 'Entrar',
    fullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    prevStop: 'Parada anterior',
    nextStop: 'Parada siguiente',
    closeModal: 'Cerrar',
    stopIndicator: 'Paradas del recorrido',
    emptyGallery: 'No hay imágenes disponibles',
    emptyPlans: 'No hay plano disponible',
    emptyTour3d: 'No hay recorrido 3D disponible',
    tabInfo: 'Info',
    tabGallery: 'Galería',
    tabPlans: 'Planos',
    tabTour3d: '3D',
  },

  media: {
    // Cambiá `desktop` a 'desktop' cuando tengas los assets para escritorio
    // dentro de public/desktop/. Si un archivo no existe, se usa el de mobile.
    roots: {
      mobile: 'mobile',
      desktop: 'mobile',
    },
    defaultDevice: 'mobile',
  },

  start: {
    image: 'inicio/complejo.svg',
    fallbackImage: 'tour/fotos/inicio.webp',
  },

  tour: {
    startStop: 'A',
    loop: true,
    stops: [
      { id: 'A', label: 'A', poster: 'tour/fotos/parada-a.webp' },
      { id: 'B', label: 'B', poster: 'tour/fotos/parada-b.webp' },
      { id: 'C', label: 'C', poster: 'tour/fotos/parada-c.webp' },
    ],
    transitions: {
      'A>B': 'tour/videos/a-b.mp4',
      'B>A': 'tour/videos/b-a.mp4',
      'A>C': 'tour/videos/a-c.mp4',
      'C>A': 'tour/videos/c-a.mp4',
      'B>C': 'tour/videos/b-c.mp4',
      'C>B': 'tour/videos/c-b.mp4',
    },
    intro: {
      video: 'tour/videos/inicio-a.mp4',
      arrivalStop: 'A',
    },
    outro: {
      video: 'tour/videos/a-inicio.mp4',
    },
  },

  buildings: [
    {
      id: 'cabana-1',
      name: 'Cabaña 1',
      entryStop: 'A',
      insideVideo: 'tour/videos/a-interior.mp4',
      interiorPoster: 'edificios/cabana-1/interior.webp',
      exitVideo: 'tour/videos/interior-a.mp4',
      hotspot: {
        stops: {
          A: { mobile: { x: 50, y: 44 }, desktop: { x: 50, y: 42 } },
          B: { mobile: { x: 58, y: 48 }, desktop: { x: 60, y: 46 } },
          C: { mobile: { x: 42, y: 48 }, desktop: { x: 40, y: 46 } },
        },
      },
      content: {
        subtitle: 'Frente al parque',
        badge: 'Disponible',
        description:
          'Cabaña de dos ambientes con vista abierta al parque central del complejo. ' +
          'Cocina equipada, dormitorio con placard empotrado y galería propia con parrilla.',
        gallery: [
          'edificios/cabana-1/galeria/01.webp',
          'edificios/cabana-1/galeria/02.webp',
          'edificios/cabana-1/galeria/03.webp',
          'edificios/cabana-1/galeria/04.webp',
        ],
        plans: [
          { title: 'Plano general', image: 'edificios/cabana-1/plano.webp' },
        ],
        tour3d: {
          title: 'Recorrido 3D interior',
          url: 'https://gaston-vr.github.io/Jejui-Dpto/',
        },
        info: {
          description:
            'Ideal para hasta 4 personas. A 200 m de la estación y a una cuadra del comercio.',
          specs: [
            { label: 'Superficie', value: '48 m²' },
            { label: 'Dormitorios', value: '1' },
            { label: 'Baños', value: '1' },
            { label: 'Capacidad', value: '4 personas' },
          ],
          features: ['Parrilla propia', 'Aire acondicionado', 'Wi-Fi', 'Estacionamiento'],
          actions: [
            { label: 'Consultar disponibilidad', url: 'https://example.com/contacto' },
          ],
        },
      },
    },
    // ── Para agregar otra cabaña, copiá el bloque anterior, cambiá el `id`,
    //    los assets y las coordenadas del hotspot. ──────────────────────────
  ],

  tabs: [
    { id: 'info', label: 'Info', icon: 'info' },
    { id: 'galeria', label: 'Galería', icon: 'photo_library' },
    { id: 'planos', label: 'Planos', icon: 'architecture' },
    { id: 'tour3d', label: '3D', icon: 'view_in_ar' },
  ],
};
