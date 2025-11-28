import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {  // Implements CanActivate interface
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(): boolean {
        const admin = this.authService.getAdmin();
        if (admin) {
            return true; // Admin is logged in
        }
        this.router.navigate(['/login']);
        // If not an admin, navigate to unauthorized or login page
        return false;
    }
}