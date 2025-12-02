import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router, private apiService: ApiService) { }

    // canActivate(): boolean {
    //     if (!this.authService.getJwtToken()) {
    //         this.router.navigate(['/auth/login']);
    //         return false;
    //     }
    //     return true;
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
