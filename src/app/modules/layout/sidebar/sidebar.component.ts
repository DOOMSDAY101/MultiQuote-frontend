import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  standalone: false,
})
export class SidebarComponent {
  constructor(private router: Router) { }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
