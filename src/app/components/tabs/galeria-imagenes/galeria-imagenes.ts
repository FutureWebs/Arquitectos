import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-galeria-imagenes',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './galeria-imagenes.html',
  styleUrl: './galeria-imagenes.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class GaleriaImagenes {
  @Input() imagenes: string[] = [];

  currentIndex = 0;

  prev() {
    this.currentIndex = this.currentIndex === 0
      ? this.imagenes.length - 1
      : this.currentIndex - 1;
  }

  next() {
    this.currentIndex = this.currentIndex === this.imagenes.length - 1
      ? 0
      : this.currentIndex + 1;
  }
}
