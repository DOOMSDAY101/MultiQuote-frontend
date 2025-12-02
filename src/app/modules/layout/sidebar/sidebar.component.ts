import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  standalone: false,
})
export class SidebarComponent {

  isSidebarOpen = false;


  constructor(private router: Router) { }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;

    if (this.isSidebarOpen) {
      document.body.classList.add('no-scroll');
      document.documentElement.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll'); // <--- ADD THIS
  }

}
