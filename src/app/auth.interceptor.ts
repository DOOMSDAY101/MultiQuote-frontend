import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse,
    HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';
import { retry } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private readonly maxRetries = 3;
    constructor(
        private authService: AuthService,
        private apiService: ApiService,
    ) { }

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {

        const jwt = this.authService.getJwtToken();
        const refreshToken = this.authService.getRefreshToken();

        // If no access AND no refresh token, skip logic
        if (!jwt && !refreshToken) {
            return next.handle(req);
        }


        if (
            !req.url.endsWith('/login') &&
            !req.url.endsWith('/forget-password') &&
            !req.url.endsWith('/create-password') &&
            !req.url.endsWith('/refresh-token')
        ) {
            const auth = this.authService.getJwtToken();
            if (auth) {
                req = req.clone({
                    headers: req.headers.set('Authorization', `Bearer ${auth}`),
                });
            }
        } else if (req.url.endsWith('/refresh-token')) {
            const authRefresh = this.authService.getRefreshToken() ?? '';
            req = req.clone({
                headers: req.headers.set('Refresh-Token', authRefresh),
            });
        }

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                const refreshToken = this.authService.getRefreshToken();

                if ((error.status === 401 || error.status === 403) && refreshToken) {
                    return this.apiService.refreshToken().pipe(
                        retry(this.maxRetries),
                        switchMap((response) => {
                            if (response?.newToken) {
                                this.authService.storeJwtToken(response.newToken);
                                const clonedReq = req.clone({
                                    headers: req.headers.set('Authorization', `Bearer ${response.newToken}`),
                                });
                                return next.handle(clonedReq);
                            } else {
                                // No token returned — logout and stop
                                this.authService.logOut();
                                return throwError(() => new Error('Invalid refresh response'));
                            }
                        }),
                        catchError((refreshError) => {
                            console.error(`Failed after ${this.maxRetries} retry attempts:`, refreshError);
                            this.authService.logOut();
                            return throwError(() => refreshError);
                        })
                    );
                } else {
                    return throwError(() => error);
                }
            })
        );
    }


}


export const httpInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
];
