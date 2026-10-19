import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DATA_ENVIRONMENT } from './data/data.environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  readonly title = DATA_ENVIRONMENT.project.name;

  ngOnInit(): void {
    document.title = DATA_ENVIRONMENT.project.name;
  }
}
