import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Floor, Apartment } from '../models/building.models';
// Importamos tu JSON estructural completo (asegúrate de guardarlo en src/app/data/edificio.json)
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
    this.sincronizarDatos('cardinales_alto_panorama');
  }

  private sincronizarDatos(edificioId: string) {
    // 1. Extraemos los pisos desde la estructura del JSON
    const pisosBase: Floor[] = (edificiosData as any).Building.pisos;

    // 2. Nos suscribimos a Firebase Firestore en tiempo real para obtener los estados mutables
    const deptosRef = collection(this.db, `edificios/${edificioId}/departamentos`);

    onSnapshot(deptosRef, (snapshot) => {
      const cambiosFirebase = new Map<string, DeptoDinamicoFirebase>();

      snapshot.docs.forEach(doc => {
        cambiosFirebase.set(doc.id, doc.data() as DeptoDinamicoFirebase);
      });

      // 3. Fusionamos los datos estáticos del JSON con los estados dinámicos de Firebase
      const pisosActualizados = pisosBase.map(piso => ({
        ...piso,
        apartamentos: piso.apartamentos.map((apto: Apartment) => {
          const dinamico = cambiosFirebase.get(apto.id);
          if (dinamico) {
            return {
              ...apto,
              estado: dinamico.estado || apto.estado,
              disponibilidadText: dinamico.disponibilidadText || apto.disponibilidadText,
              datosEstaticos: {
                ...apto.datosEstaticos,
                disponibilidad: dinamico.disponibilidadText || apto.disponibilidadText
              }
            };
          }
          return apto;
        })
      }));

      // Actualizamos la señal global reactiva
      this.edificioPisos.set(pisosActualizados);
    });
  }
}
