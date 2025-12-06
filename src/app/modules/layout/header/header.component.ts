import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: false,
})
export class HeaderComponent implements OnInit {

  @Output() toggleSidebar = new EventEmitter<void>();


  userName: string | null = null;
  currentRouteName: string = '';


  constructor(private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    const admin = this.authService.getAdmin();
    const user = this.authService.getUser();

    // whichever exists, admin or user
    const currentUser = admin || user;

    this.userName = currentUser?.firstName || null;
    this.setRouteName(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setRouteName(event.urlAfterRedirects);
      });
  }


  private setRouteName(url: string) {
    const route = url.replace('/', '');

    if (route === '' || route === 'dashboard') {
      this.currentRouteName = '';
    } else {
      this.currentRouteName = this.formatRouteName(route);
    }
  }
  private formatRouteName(route: string): string {
    return route
      .replace('-', ' ')       // convert hyphens into spaces
      .replace(/\b\w/g, c => c.toUpperCase());  // capitalize words
  }
}