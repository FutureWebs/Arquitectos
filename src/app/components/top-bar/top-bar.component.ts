import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
  // Inputs para controlar la visibilidad y estados de cada botón según el "momento" de la web
  @Input() mostrarMenuBtn: boolean = true;
  @Input() mostrarBackBtn: boolean = true;
  @Input() mostrarFullscreenBtn: boolean = true;
  @Input() isBlocked: boolean = false; // Desactiva todos los botones (ej: durante animaciones)
  @Input() isFullscreen: boolean = false;

  // Outputs para emitir las acciones al componente padre
  @Output() menuClicked = new EventEmitter<void>();
  @Output() backClicked = new EventEmitter<void>();
  @Output() fullscreenToggled = new EventEmitter<void>();

  onMenuClick() {
    this.menuClicked.emit();
  }

  onBackClick() {
    this.backClicked.emit();
  }

  toggleFullscreen() {
    this.fullscreenToggled.emit();
  }
}
