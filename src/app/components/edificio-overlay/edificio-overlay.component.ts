import { Component, Input, Output, EventEmitter } from '@angular/core';
import {Apartment, Floor} from '../../models/building.models';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-edificio-overlay',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './edificio-overlay.component.html',
  styleUrls: ['./edificio-overlay.component.css']
})
export class EdificioOverlay {
  @Input({ required: true }) floorData!: Floor;
  @Input({ required: true }) listaPisos: Floor[] = [];
  @Input() isVisible = false;
  @Input() isFullscreen = false;

  @Output() backPressed = new EventEmitter<void>();
  @Output() toggleFullscreen = new EventEmitter<void>();
  @Output() apartmentSelected = new EventEmitter<Apartment>();
  @Output() floorChanged = new EventEmitter<Floor>();
}

