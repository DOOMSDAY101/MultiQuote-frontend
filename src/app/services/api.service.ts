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
import { PaginatedUsers } from '../models/user.model';

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
    private getHeaders(auth: boolean = true, isJson: boolean = true): HttpHeaders {
        const headersConfig: { [key: string]: string } = {};

        if (isJson) {
            headersConfig['Content-Type'] = 'application/json';
        }

        if (auth) {
            headersConfig['Authorization'] = `Bearer ${this.authService.getJwtToken()}`;
        }

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
    verifyToken(): Observable<any> {
        return this.get<any>('/auth/me', true).pipe(
            catchError((err) => {
                // If refresh failed, delete tokens
                if (err.status === 401 || err.status === 403) {
                    this.authService.deleteTokens();
                }
                return throwError(() => err);
            })
        );
    }

    getUsers(
        page: number = 1,
        limit: number = 10,
        search?: string,
        role?: string,
        status?: string
    ): Observable<PaginatedUsers> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (search) params = params.set('search', search);
        if (role) params = params.set('role', role);
        if (status) params = params.set('status', status);

        return this.get<PaginatedUsers>('/users', true, params);
    }

    createUser(userData: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
        role?: string;
        imgFile?: File;
        signatureFile?: File;
    }): Observable<any> {
        const formData = new FormData();

        // Dynamically append each property
        Object.entries(userData).forEach(([key, value]) => {
            if (value) {
                // For files, append as is
                if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    // For text values
                    formData.append(key, value.toString());
                }
            }
        });

        return this.http.post<any>(`${this.baseUrl}/auth/create-user`, formData, {
            headers: this.getHeaders(true, false), // auth headers
        }).pipe(catchError(this.handleError<any>('createUser')));
    }

    editUser(userId: string, userData: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
        role?: string;
        password?: string;
        imgFile?: File;
        signatureFile?: File;
    }): Observable<any> {
        const formData = new FormData();

        // Dynamically append each property if it exists
        Object.entries(userData).forEach(([key, value]) => {
            if (value) {
                if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        return this.http.patch<any>(`${this.baseUrl}/auth/edit-user/${userId}`, formData, {
            headers: this.getHeaders(true, false), // auth headers, no JSON since FormData
        }).pipe(
            catchError(this.handleError<any>('editUser'))
        );
    }

    toggleUserStatus(userId: string): Observable<any> {
        return this.patch<any>(`/auth/user/${userId}/toggle-status`);
    }


    createCompany(data: {
        name: string;
        email?: string;
        phoneNumber?: string;
        address?: string;
        logoFile?: File;
    }): Observable<any> {

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                if (value instanceof File) {
                    formData.append('logo', value);   // backend uses req.file
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        return this.http.post<any>(
            `${this.baseUrl}/company`,
            formData,
            { headers: this.getHeaders(true, false) }  // auth but NO JSON headers
        ).pipe(
            catchError(this.handleError<any>('createCompany'))
        );
    }



    updateCompany(
        companyId: string,
        data: {
            name?: string;
            email?: string;
            phoneNumber?: string;
            address?: string;
            logoFile?: File;
        }
    ): Observable<any> {

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                if (value instanceof File) {
                    formData.append('logo', value);     // backend expects req.file
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        return this.http.put<any>(
            `${this.baseUrl}/company/${companyId}`,
            formData,
            { headers: this.getHeaders(true, false) }
        ).pipe(
            catchError(this.handleError<any>('updateCompany'))
        );
    }



    getCompanies(
        page: number = 1,
        limit: number = 10,
        search?: string,
    ): Observable<any> {

        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (search) params = params.set('search', search);

        return this.get<any>('/company', true, params);
    }
}
