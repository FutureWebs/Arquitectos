
import { Floor } from '../models/building.models';
import {InfoDepto} from '../models/info-depto';

const infoTest: InfoDepto = {
     titulo: 'Apto-A',
     edificio: 'Torre A',
     piso: '5',
     tipologia: 'Tipología D',
     metrosCuadrados: 60,
     banios: 1,
     dormitorios: 1,
     lavadero: true,
     balcon: true,
     cochera: false,
     disponibilidad: 'Disponible para vender',
     fotoTitulo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
     imagenes: [
       'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
       'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
       'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
       'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400',
     ],
     plano: 'mobile/test/plano_test.webp',
     planta3D: 'https://gaston-vr.github.io/Jejui-Dpto/',
   };

const infoTest2: InfoDepto = {
  titulo: 'Apto-B',
  edificio: 'Torre A',
  piso: '39',
  tipologia: 'Tipología D',
  metrosCuadrados: 60,
  banios: 1,
  dormitorios: 1,
  lavadero: true,
  balcon: true,
  cochera: false,
  disponibilidad: 'Reservado',
  fotoTitulo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  imagenes: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400',
  ],
  plano: 'mobile/test/plano_test.webp',
  planta3D: 'https://gaston-vr.github.io/Jejui-Dpto/',
};
const infoTest3: InfoDepto = {
  titulo: 'Apto-C',
  edificio: 'Torre A',
  piso: '39',
  tipologia: 'Tipología B',
  metrosCuadrados: 80,
  banios: 1,
  dormitorios: 1,
  lavadero: true,
  balcon: true,
  cochera: false,
  disponibilidad: 'Disponible para vender',
  fotoTitulo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  imagenes: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400',
  ],
  plano: 'mobile/test/plano_test.webp',
  planta3D: 'https://gaston-vr.github.io/Jejui-Dpto/',
};
const infoTest4: InfoDepto = {
  titulo: 'Apto-D',
  edificio: 'Torre A',
  piso: '39',
  tipologia: 'Tipología A',
  metrosCuadrados: 80,
  banios: 1,
  dormitorios: 1,
  lavadero: true,
  balcon: true,
  cochera: false,
  disponibilidad: 'Vendido',
  fotoTitulo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  imagenes: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400',
  ],
  plano: 'mobile/test/plano_test.webp',
  planta3D: 'https://gaston-vr.github.io/Jejui-Dpto/',
};


const PLANTA_BASE_5_12: Omit<Floor, 'nivel'> = {
  nombre: "Pisos 1 al 12",
  planoFondoSvg: "mobile/vuelo/fotos/top.webp",
  apartamentos: [
    {
      id: "Apto-A",
      // Corresponde al cuarto path (Arriba izquierda en el plano vertical)
      svgPathCode: "M432 849.5V540H127.5V594H114V662H127.5V778.5H114V862.5V899H375.5V849.5H432Z",
      estado: "DISPONIBLE",
      datos: infoTest,
      multimedia: { galeria: [], plano2D: "mobile/vuelo/planos/5-12-A.jpg", url3D: "" }
    },
    {
      id: "Apto-B",
      // Corresponde al tercer path (Abajo izquierda en el plano vertical)
      svgPathCode: "M431 1248L426 921H375.5V901H112.5V926.5V1011L127.5 1016V1131H112.5V1197H127.5V1248H431Z",
      estado: "RESERVADO",
      datos: infoTest2,
      multimedia: { galeria: [], plano2D: "mobile/vuelo/planos/5-12-B.jpg", url3D: "" }
    },
    {
      id: "Apto-C",
      // Corresponde al primer path (Arriba derecha en el plano vertical)
      svgPathCode: "M683 540V847.5H743.5V895H982.5V862.5H995V778H982.5V660H995V595H982.5V540H683Z",
      estado: "DISPONIBLE",
      datos: infoTest3,
      multimedia: { galeria: [], plano2D: "mobile/vuelo/planos/5-12-C.jpg", url3D: "" }
    },
    {
      id: "Apto-D",
      // Corresponde al segundo path (Abajo derecha en el plano vertical)
      svgPathCode: "M687.5 1248V923H742V895H984.5V927H996.5V1016H984.5V1133H996.5V1198.5H984.5V1253L687.5 1248Z",
      estado: "VENDIDO",
      datos: infoTest4,
      multimedia: { galeria: [], plano2D: "mobile/vuelo/planos/5-12-D.jpg", url3D: "" }
    }
  ]
};

// 2. Generamos el listado real de pisos mapeando los datos para simular una base de datos real
const generarEdificio = (): Floor[] => {
  const pisos: Floor[] = [];

  // Clonamos la estructura para los pisos del 5 al 12
  for (let i = 1; i <= 11; i++) {
    pisos.push({
      nivel: i,
      nombre: `Piso ${i}`,
      planoFondoSvg: PLANTA_BASE_5_12.planoFondoSvg,
      // Usamos JSON.parse para romper la referencia en memoria y que cada piso sea independiente
      apartamentos: JSON.parse(JSON.stringify(PLANTA_BASE_5_12.apartamentos)).map((apto: any) => {
        // Opcional: Podés cambiar el ID para que coincida con el piso real, ej: "Apto-5A"
        apto.id = `Apto-${i}${apto.id.split('-')[1]}`;
        return apto;
      })
    });
  }

  // Añadimos el piso 13 de forma directa
  return pisos;
};

export const EDIFICIO_COMPLETO: Floor[] = generarEdificio();
