import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EdificioService {
  private app = initializeApp(environment.firebaseConfig);
  private db = getFirestore(this.app);

  constructor() {}

  // Obtener la info del edificio (incluye el campo "activo" para el control de pagos)
  async getEdificioInfo(edificioId: string) {
    const docRef = doc(this.db, 'edificios', edificioId);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  // Obtener los departamentos del edificio
  async getDepartamentos(edificioId: string) {
    const colRef = collection(this.db, `edificios/${edificioId}/departamentos`);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Actualizar el estado de un departamento
  async actualizarEstadoDepto(edificioId: string, deptoId: string, nuevoEstado: string) {
    const docRef = doc(this.db, `edificios/${edificioId}/departamentos`, deptoId);
    await updateDoc(docRef, { estado: nuevoEstado });
  }
}
