import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  @Input() isOpen: boolean = false;
  @Output() closeSidenav = new EventEmitter<void>();

  ubicacionUrl = 'https://maps.app.goo.gl/N3P3VjhsurUdVeBo8';

  constructor(private router: Router) {}

  close() {
    this.closeSidenav.emit();
  }

  goToLogin() {
    this.close();
    this.router.navigate(['/login']);
  }
}
