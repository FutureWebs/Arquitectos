import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserProfile } from '../../services/auth.service';
import { EdificioService } from '../../services/edificio.service';
import { collection, onSnapshot, getFirestore } from 'firebase/firestore'; // Asegúrate de importar esto si usas Firestore directo o ponlo en tu servicio

@Component({
  selector: 'app-admin-edificio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-edificio.component.html',
  styleUrl: './admin-edificio.component.css'
})
export class AdminEdificioComponent implements OnInit {
  userProfile: UserProfile | null = null;
  edificioActivo: boolean = true;
  departamentos: any[] = [];

  constructor(
    public authService: AuthService,
    private edificioService: EdificioService
  ) {}

  ngOnInit() {
    this.authService.userProfile$.subscribe(async (profile) => {
      if (profile) {
        this.userProfile = profile;
        if (profile.edificio_id) {
          // Cargamos la info y los departamentos en tiempo real usando el ID del perfil
          this.cargarDatosEdificio(profile.edificio_id);
        }
      }
    });
  }

  async cargarDatosEdificio(edificio_id: string) {
    try {
      const edificioData: any = await this.edificioService.getEdificioInfo(edificio_id);
      if (edificioData) {
        this.edificioActivo = edificioData.activo ?? true;
      }

      let deptos = await this.edificioService.getDepartamentos(edificio_id);

      // Ordenar correctamente (ej: P1-Apto-2 antes que P1-Apto-10)
      deptos.sort((a: any, b: any) => {
        return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
      });

      this.departamentos = deptos;
      console.log("Departamentos ordenados:", this.departamentos);
    } catch (error) {
      console.error("Error al cargar los datos del edificio:", error);
    }
  }

  async cambiarEstado(depto: any, nuevoEstado: string) {
    if (!this.edificioIdValido()) return;

    try {
      // Actualizamos en Firebase usando el id del documento (ej: "P1-Apto-10")
      await this.edificioService.actualizarEstadoDepto(this.userProfile!.edificio_id!, depto.id, nuevoEstado);

      // Actualizamos localmente de inmediato para que la UI responda al instante
      depto.estado = nuevoEstado;
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("No se pudo actualizar el estado. Verifique sus permisos.");
    }
  }

  private edificioIdValido(): boolean {
    return !!this.userProfile?.edificio_id;
  }
}
