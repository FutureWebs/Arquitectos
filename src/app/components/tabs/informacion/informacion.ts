import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InfoDepto } from '../../../models/info-depto';

@Component({
  selector: 'app-informacion',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './informacion.html',
  styleUrl: './informacion.css'
})
export class Informacion {
  @Input() info!: InfoDepto;
}
