import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
    HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    // private baseUrl: string = 'https://api.example.com/api/v1'; //change later

    private baseUrl: string = 'http://localhost:5000/api/v1';

    constructor(
        private http: HttpClient,
        private router: Router,
        private authService: AuthService
    ) { }

    // ========= HELPERS =========
    private getHeaders(auth: boolean = true): HttpHeaders {
        const headersConfig: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };
        if (auth)
            headersConfig[
                'Authorization'
            ] = `Bearer ${this.authService.getJwtToken()}`;
        return new HttpHeaders(headersConfig);
    }

    private get<T>(endpoint: string, auth = true, params?: any): Observable<T> {
        return this.http
            .get<T>(`${this.baseUrl}${endpoint}`, {
                headers: this.getHeaders(auth),
                params,
            })
            .pipe(catchError(this.handleError<T>(endpoint)));
    }

    private post<T>(endpoint: string, data: any, auth = true): Observable<T> {
        return this.http
            .post<T>(`${this.baseUrl}${endpoint}`, data, {
                headers: this.getHeaders(auth),
            })
            .pipe(catchError(this.handleError<T>(endpoint)));
    }

    private put<T>(endpoint: string, data: any, auth = true): Observable<T> {
        return this.http
            .put<T>(`${this.baseUrl}${endpoint}`, data, {
                headers: this.getHeaders(auth),
            })
            .pipe(catchError(this.handleError<T>(endpoint)));
    }

    private patch<T>(endpoint: string, data?: any, auth = true): Observable<T> {
        return this.http
            .patch<T>(`${this.baseUrl}${endpoint}`, data, {
                headers: this.getHeaders(auth),
            })
            .pipe(catchError(this.handleError<T>(endpoint)));
    }

    private delete<T>(endpoint: string, auth = true): Observable<T> {
        return this.http
            .delete<T>(`${this.baseUrl}${endpoint}`, {
                headers: this.getHeaders(auth),
            })
            .pipe(catchError(this.handleError<T>(endpoint)));
    }
    // ========= ERROR HANDLER =========
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: HttpErrorResponse): Observable<T> => {
            console.error(`${operation} failed: ${error.message}`);
            return throwError(() => error);
        };
    }


    // API METHODS HERE

    refreshToken(): Observable<any> {
        const url = `${this.baseUrl}/auth/refresh-token`;
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.authService.getRefreshToken()}`, // ✅ Standard convention
        });
        const body = { refreshToken: this.authService.getRefreshToken() };

        return this.http
            .post<any>(url, body, { headers })
            .pipe(catchError(this.handleError<any>('refreshToken')));
    }

    login(email: string, password: string): Observable<any> {
        const url = `${this.baseUrl}/auth/login`;
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const body = { email, password };

        return this.http
            .post<any>(url, body, { headers })
            .pipe(catchError(this.handleError<any>('login')));
    }

    verifyCode(email: string, code: string) {
        return this.post<any>('/auth/verify-login-code', { email, code }, false);
    }

    resendCode(email: string) {
        return this.post<any>('/auth/resend-code', { email }, false);
    }
    //   getDashboardStats(params?: any): Observable<any> {
    //     const url = `${this.baseUrl}/admin/dashboard/`;
    //     return this.http
    //       .get<any>(url, { headers: this.getHeaders(), params })
    //       .pipe(catchError(this.handleError('getDashboardStats')));
    //   }
}
