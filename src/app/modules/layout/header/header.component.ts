import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: false,
})
export class HeaderComponent implements OnInit {

  userName: string | null = null;


  constructor(private authService: AuthService) { }

  ngOnInit() {
    const admin = this.authService.getAdmin();
    const user = this.authService.getUser();

    // whichever exists, admin or user
    const currentUser = admin || user;

    this.userName = currentUser?.firstName || null;
  }

}
