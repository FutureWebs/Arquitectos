import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Floor, Apartment } from '../models/building.models';
import edificiosData from '../data/data.json';

interface DeptoDinamicoFirebase {
  id: string;
  estado: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
  disponibilidadText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BuildingDataService {
  private app = initializeApp(environment.firebaseConfig);
  private db = getFirestore(this.app);

  public edificioPisos = signal<Floor[]>([]);

  constructor() {
    this.sincronizarDatos('edificio_1');
  }

  private sincronizarDatos(edificioId: string) {
    // 1. Extraemos los pisos base desde la estructura estática del JSON (fuente de respaldo)
    const pisosBase: Floor[] = (edificiosData as any).Building.pisos;

    // 2. Referencia a la colección en Firebase Firestore
    const deptosRef = collection(this.db, `edificios/${edificioId}/departamentos`);


    // Función auxiliar para derivar el texto de disponibilidad según el estado
    const obtenerTextoDisponibilidad = (estado: string): string => {
      switch (estado?.toUpperCase()) {
        case 'DISPONIBLE':
          return 'Disponible';
        case 'RESERVADO':
          return 'Reservado';
        case 'VENDIDO':
          return 'Vendido';
        default:
          return 'Disponible'; // Valor por defecto o el que prefieras
      }
    };

    // 3. Nos suscribimos en tiempo real manejando posibles errores
    onSnapshot(deptosRef,
      (snapshot) => {

        const cambiosFirebase = new Map<string, DeptoDinamicoFirebase>();

        snapshot.docs.forEach(doc => {
          cambiosFirebase.set(doc.id, doc.data() as DeptoDinamicoFirebase);
        });

        // Fusionamos y derivamos el texto en base al estado
        const pisosActualizados = pisosBase.map(piso => ({
          ...piso,
          apartamentos: piso.apartamentos.map((apto: Apartment) => {
            const dinamico = cambiosFirebase.get(apto.id);

            if (dinamico) {
              // Obtenemos el estado (priorizando Firebase, si no el del JSON)
              const estadoFinal = dinamico.estado ?? apto.estado;
              // Derivamos el texto automáticamente del estado
              const textoFinal = obtenerTextoDisponibilidad(estadoFinal);

              return {
                ...apto,
                estado: estadoFinal,
                disponibilidadText: textoFinal,
                datosEstaticos: {
                  ...apto.datosEstaticos,
                  disponibilidad: textoFinal
                }
              };
            }

            // Si no está en Firebase, aseguramos también derivarlo del estado del JSON por coherencia
            const estadoJson = apto.estado;
            const textoJson = obtenerTextoDisponibilidad(estadoJson);

            return {
              ...apto,
              disponibilidadText: textoJson,
              datosEstaticos: {
                ...apto.datosEstaticos,
                disponibilidad: textoJson
              }
            };
          })
        }));

        // Actualizamos la señal reactiva
        this.edificioPisos.set(pisosActualizados);
      },
      (error) => {
        console.error("Error al sincronizar con Firebase, usando datos del JSON como respaldo:", error);

        // Aplicamos respaldo asegurando también los textos derivados
        const pisosRespaldo = pisosBase.map(piso => ({
          ...piso,
          apartamentos: piso.apartamentos.map((apto: Apartment) => {
            const textoJson = obtenerTextoDisponibilidad(apto.estado);
            return {
              ...apto,
              disponibilidadText: textoJson,
              datosEstaticos: {
                ...apto.datosEstaticos,
                disponibilidad: textoJson
              }
            };
          })
        }));

        this.edificioPisos.set(pisosRespaldo);
      }
    );
  }
}
