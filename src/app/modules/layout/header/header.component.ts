import { Component, OnInit } from '@angular/core';
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

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const route = this.router.url.replace('/', '');

      // if it's dashboard → show generic
      if (route === '' || route === 'dashboard') {
        this.currentRouteName = '';
      } else {
        // convert route to readable name
        this.currentRouteName = this.formatRouteName(route);
      }
    });
  }


  private formatRouteName(route: string): string {
    return route
      .replace('-', ' ')       // convert hyphens into spaces
      .replace(/\b\w/g, c => c.toUpperCase());  // capitalize words
  }
}