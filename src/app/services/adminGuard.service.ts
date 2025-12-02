import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {  // Implements CanActivate interface
    constructor(private authService: AuthService, private router: Router, private apiService: ApiService) { }

    // canActivate(): boolean {
    //     const admin = this.authService.getAdmin();
    //     if (admin) {
    //         return true; // Admin is logged in
    //     }
    //     this.router.navigate(['/auth/login']);
    //     // If not an admin, navigate to unauthorized or login page
    //     return false;
    // }
    canActivate(): Observable<boolean> {
        return this.apiService.verifyToken().pipe(
            map(() => true), // token valid
            catchError(() => {
                this.router.navigate(['/auth/login']);
                return of(false);
            })
        );
    }
}