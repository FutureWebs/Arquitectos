// --- DENTRO DE FIREBASE (Datos mutables modificables por el Admin) ---
export interface DeptoDinamicoFirebase {
  id: string;                      // Ej: "Apto-5A"
  estado: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
  precio: number;
  disponibilidadText?: string;     // Ej: "Disponible para vender", "Reservado"
  // Permite sobreescribir características si el admin lo cambia
  cochera?: boolean;
}

// --- DENTRO DEL JSON LOCAL (Estructura visual pesada) ---
export interface InfoDeptoEstatico {
  titulo: string;
  edificio: string;
  piso: string;
  tipologia: string;
  metrosCuadrados: number;
  banios: number;
  dormitorios: number;
  lavadero: boolean;
  balcon: boolean;
  cochera: boolean;
  fotoTitulo: string;
  imagenes: string[];
  plano: string;
  planta3D: string;
}

export interface Apartment {
  id: string;                     // Clave primaria de cruce (ej: "Apto-5A")
  svgPathCode: string;            // Trazo SVG
  datosEstaticos: InfoDeptoEstatico;

  badgeCoords: { x: number; y: number }; // Centro del badge en coordenadas SVG (1920x1080)
  estado: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
  precio?: number;
  disponibilidadText?: string;
}

export interface Floor {
  nivel: number;
  nombre: string;
  planoFondoSvg: string;
  apartamentos: Apartment[];
}

export interface BuildingStructure {
  id: string;
  nombre: string;
  pisos: Floor[];
}
