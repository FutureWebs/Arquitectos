export interface InfoDepto {
  titulo: string; //Ej: "39-D"
  edificio: string; //Ej: "Torre 100"
  piso: string; //Ej: "39"
  tipologia: string;
  metrosCuadrados: number;
  banios: number;
  dormitorios: number;
  precio?: number;

  disponibilidad?: string; //ESTADOS: "Disponible para vender", "Disponible para alquilar", "Vendido", "Alquilado"

  lavadero: boolean;
  balcon: boolean;
  cochera: boolean;

  fotoTitulo: string; //URL de la foto principal, acompaña al titulo (dentro o fuera del proyecto)
  imagenes: string[]; //URLs de las imágenes (dentro o fuera del proyecto)
  plano: string; //URL del plano (dentro o fuera del proyecto)
  planta3D: string; //Link del github con el recorrido 3D
}
