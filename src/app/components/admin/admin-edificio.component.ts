import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserProfile } from '../../services/auth.service';
import { EdificioService } from '../../services/edificio.service';

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
          await this.cargarDatosEdificio(profile.edificio_id);
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
      this.departamentos = await this.edificioService.getDepartamentos(edificio_id);
    } catch (error) {
      console.error("Error al cargar los datos del edificio:", error);
    }
  }

  async cambiarEstado(depto: any, nuevoEstado: string) {
    if (!this.edificioIdValido()) return;

    try {
      await this.edificioService.actualizarEstadoDepto(this.userProfile!.edificio_id!, depto.id, nuevoEstado);
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
