
import { Apartment, Floor } from '../models/building.models';
import {InfoDepto} from '../models/info-depto';
/*
const crearInfoDepto = (titulo: string, piso: string, tipologia: string, estado: string): InfoDepto => ({
  titulo,
  edificio: 'Torre A',
  piso,
  tipologia,
  metrosCuadrados: tipologia.includes('Pequeno') ? 45 : 70,
  banios: 1,
  dormitorios: tipologia.includes('Pequeno') ? 1 : 2,
  lavadero: true,
  balcon: true,
  cochera: false,
  disponibilidad: estado,
  fotoTitulo: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  imagenes: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400',
  ],
  plano: 'mobile/test/plano_test.webp',
  planta3D: 'https://gaston-vr.github.io/Jejui-Dpto/',
});

// ============================================
// PLANTA 17 DEPTOS (Piso 01-06 - piso madera)
// 7 deptos arriba (1-7) + 10 deptos abajo (8-17)
// ============================================
const PLANTA_17_DEPTOS: Omit<Floor, 'nivel'> = {
  nombre: "1",
  planoFondoSvg: "mobile/vuelo/fotos/Satelital/Piso_01.jpg",
  apartamentos: [
    // FILA NORTE (arriba) - y: 262-463
    {
      id: "Apto-1",
      svgPathCode: "M465,262 L560,262 L560,463 L465,463 Z",
      badgeCoords: { x: 512, y: 362 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('1', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-2",
      svgPathCode: "M563,262 L660,262 L660,463 L563,463 Z",
      badgeCoords: { x: 611, y: 362 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('2', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-3",
      svgPathCode: "M660,262 L755,262 L755,463 L660,463 Z",
      badgeCoords: { x: 707, y: 362 },
      estado: "RESERVADO",
      datos: crearInfoDepto('3', '1', 'Tipología Pequeño', 'Reservado'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-4",
      svgPathCode: "M755,262 L843,262 L843,463 L755,463 Z",
      badgeCoords: { x: 799, y: 362 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('4', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-5",
      svgPathCode: "M843,262 L938,262 L938,463 L843,463 Z",
      badgeCoords: { x: 890, y: 362 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('5', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-6",
      svgPathCode: "M938,262 L1038,262 L1038,463 L938,463 Z",
      badgeCoords: { x: 988, y: 362 },
      estado: "VENDIDO",
      datos: crearInfoDepto('6', '1', 'Tipología Pequeño', 'Vendido'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-7",
      svgPathCode: "M1038,262 L1140,262 L1140,463 L1038,463 Z",
      badgeCoords: { x: 1089, y: 362 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('7', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    // FILA SUR (abajo) - y: 512-742
    {
      id: "Apto-8",
      svgPathCode: "M455,512 L543,512 L543,742 L455,742 Z",
      badgeCoords: { x: 499, y: 627 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('8', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-9",
      svgPathCode: "M543,512 L648,512 L648,742 L543,742 Z",
      badgeCoords: { x: 595, y: 627 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('9', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-10",
      svgPathCode: "M648,512 L748,512 L748,742 L648,742 Z",
      badgeCoords: { x: 698, y: 627 },
      estado: "RESERVADO",
      datos: crearInfoDepto('10', '1', 'Tipología Pequeño', 'Reservado'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-11",
      svgPathCode: "M748,512 L843,512 L843,742 L748,742 Z",
      badgeCoords: { x: 795, y: 627 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('11', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-12",
      svgPathCode: "M843,512 L938,512 L938,742 L843,742 Z",
      badgeCoords: { x: 890, y: 627 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('12', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-13",
      svgPathCode: "M938,512 L1038,512 L1038,742 L938,742 Z",
      badgeCoords: { x: 988, y: 627 },
      estado: "VENDIDO",
      datos: crearInfoDepto('13', '1', 'Tipología Pequeño', 'Vendido'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-14",
      svgPathCode: "M1038,512 L1140,512 L1140,742 L1038,742 Z",
      badgeCoords: { x: 1089, y: 627 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('14', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-15",
      svgPathCode: "M1140,512 L1243,512 L1243,742 L1140,742 Z",
      badgeCoords: { x: 1191, y: 627 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('15', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-16",
      svgPathCode: "M1243,512 L1343,512 L1343,742 L1243,742 Z",
      badgeCoords: { x: 1293, y: 627 },
      estado: "RESERVADO",
      datos: crearInfoDepto('16', '1', 'Tipología Pequeño', 'Reservado'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-17",
      svgPathCode: "M1343,512 L1443,512 L1443,742 L1343,742 Z",
      badgeCoords: { x: 1393, y: 627 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('17', '1', 'Tipología Pequeño', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    }
  ]
};

// ============================================
// PLANTA 7 DEPTOS (Piso 07-20 y Top_00 - piso blanco)
// 3 deptos arriba (1-3) + 4 deptos abajo (4-7)
// ============================================
const PLANTA_7_DEPTOS: Omit<Floor, 'nivel'> = {
  nombre: "7",
  planoFondoSvg: "mobile/vuelo/fotos/Satelital/Piso_07.jpg",
  apartamentos: [
    // FILA NORTE (arriba)
    {
      id: "Apto-1",
      svgPathCode: "M465,262 L750,262 L750,465 L465,465 Z",
      badgeCoords: { x: 607, y: 363 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('1', '7', 'Tipología Mediano', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-2",
      svgPathCode: "M752,248 L945,248 L945,465 L752,465 Z",
      badgeCoords: { x: 848, y: 356 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('2', '7', 'Tipología Mediano', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-3",
      svgPathCode: "M945,248 L1140,248 L1140,465 L945,465 Z",
      badgeCoords: { x: 1042, y: 356 },
      estado: "RESERVADO",
      datos: crearInfoDepto('3', '7', 'Tipología Mediano', 'Reservado'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    // FILA SUR (abajo)
    {
      id: "Apto-4",
      svgPathCode: "M460,510 L748,510 L748,742 L460,742 Z",
      badgeCoords: { x: 604, y: 626 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('4', '7', 'Tipología Mediano', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-5",
      svgPathCode: "M750,510 L945,510 L945,742 L750,742 Z",
      badgeCoords: { x: 847, y: 626 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('5', '7', 'Tipología Mediano', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-6",
      svgPathCode: "M945,510 L1140,510 L1140,742 L945,742 Z",
      badgeCoords: { x: 1042, y: 626 },
      estado: "VENDIDO",
      datos: crearInfoDepto('6', '7', 'Tipología Mediano', 'Vendido'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    },
    {
      id: "Apto-7",
      svgPathCode: "M1140,510 L1440,510 L1440,742 L1140,742 Z",
      badgeCoords: { x: 1290, y: 626 },
      estado: "DISPONIBLE",
      datos: crearInfoDepto('7', '7', 'Tipología Mediano', 'Disponible para vender'),
      multimedia: { galeria: [], plano2D: "", url3D: "" }
    }
  ]
};

// ============================================
// GENERACIÓN DE PISOS
// ============================================
const generarEdificio = (): Floor[] => {
  const pisos: Floor[] = [];

  // Estacionamiento (sin SVG)
  pisos.push({
    nivel: 0,
    nombre: 'E',
    planoFondoSvg: 'mobile/vuelo/fotos/Satelital/Estacionamiento.jpg',
    apartamentos: []
  });

  // Piso 00 - Planta Baja (sin SVG)
  pisos.push({
    nivel: 1,
    nombre: 'PB',
    planoFondoSvg: 'mobile/vuelo/fotos/Satelital/Piso_00.jpg',
    apartamentos: []
  });

  // Pisos 1-6: 17 deptos (planta madera)
  for (let i = 1; i <= 6; i++) {
    const imagenPiso = `mobile/vuelo/fotos/Satelital/Piso_${String(i).padStart(2, '0')}.jpg`;
    pisos.push({
      nivel: i + 1,
      nombre: `${i}`,
      planoFondoSvg: imagenPiso,
      apartamentos: JSON.parse(JSON.stringify(PLANTA_17_DEPTOS.apartamentos)).map((apto: Apartment) => {
        apto.datos.piso = `${i}`;
        return apto;
      })
    });
  }

  // Pisos 7-20: 7 deptos (planta blanca)
  for (let i = 7; i <= 20; i++) {
    const imagenPiso = `mobile/vuelo/fotos/Satelital/Piso_${String(i).padStart(2, '0')}.jpg`;
    pisos.push({
      nivel: i + 1,
      nombre: `${i}`,
      planoFondoSvg: imagenPiso,
      apartamentos: JSON.parse(JSON.stringify(PLANTA_7_DEPTOS.apartamentos)).map((apto: Apartment) => {
        apto.datos.piso = `${i}`;
        return apto;
      })
    });
  }

  // Top_00: 7 deptos (planta blanca)
  pisos.push({
    nivel: 22,
    nombre: 'T',
    planoFondoSvg: 'mobile/vuelo/fotos/Satelital/Top_00.jpg',
    apartamentos: JSON.parse(JSON.stringify(PLANTA_7_DEPTOS.apartamentos)).map((apto: Apartment) => {
      apto.datos.piso = 'Top';
      return apto;
    })
  });

  // Top_01 (sin SVG)
  pisos.push({
    nivel: 23,
    nombre: 'T1',
    planoFondoSvg: 'mobile/vuelo/fotos/Satelital/Top_01.jpg',
    apartamentos: []
  });

  // Top_02 (sin SVG) - usa top.webp
  pisos.push({
    nivel: 24,
    nombre: 'T2',
    planoFondoSvg: 'mobile/vuelo/fotos/top.webp',
    apartamentos: []
  });

  return pisos;
};

export const EDIFICIO_COMPLETO: Floor[] = generarEdificio();

*/
