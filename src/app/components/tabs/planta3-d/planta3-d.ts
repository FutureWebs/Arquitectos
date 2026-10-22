import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-planta3-d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planta3-d.html',
  styleUrl: './planta3-d.css'
})
export class Planta3D {
  @Input() modelos: string[] = [];

  modeloSeleccionado: string | null = null;

  seleccionarModelo(url: string) {
    this.modeloSeleccionado = this.modeloSeleccionado === url ? null : url;
  }
}
