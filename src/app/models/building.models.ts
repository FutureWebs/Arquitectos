import {InfoDepto} from './info-depto';

export interface Apartment {
  id: string; // ej: "Apto-1A"
  svgPathCode: string; // El <path d="..."> del SVG para dibujarlo
  badgeCoords: { x: number; y: number }; // Centro del badge en coordenadas SVG (1920x1080)
  estado: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
  datos: InfoDepto;
  multimedia: {
    galeria: string[]; // URLs de las fotos
    plano2D: string;
    url3D: string;
  };
}

export interface Floor {
  nivel: number;
  nombre: string; // ej: "Planta Baja", "Piso 1"
  planoFondoSvg: string; // La imagen base o SVG estructural del piso
  apartamentos: Apartment[];
}

export interface Building {
  id: string;
  nombre: string;
  plantas: Floor[];
}
