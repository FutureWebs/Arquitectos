import { Component, Input } from '@angular/core';
import { BuildingInfo } from '../../../models/environment.models';

/** Pestaña "Info": descripción, datos, características y acciones del edificio. */
@Component({
  selector: 'app-informacion',
  standalone: true,
  templateUrl: './informacion.html',
  styleUrl: './informacion.css',
})
export class Informacion {
  @Input() info?: BuildingInfo;
}
