// auth.service.ts
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import jwt_decode from 'jwt-decode';
import { UserRole } from "../models/user.model";

interface JwtPayload {
    id: string;
    role: UserRole.SUPER_ADMIN | UserRole.ADMIN | UserRole.USER;
    login_history_id?: string;
}

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private readonly JWT_TOKEN = "JWT_TOKEN";
    private readonly REFRESH_TOKEN = "REFRESH_TOKEN";
    private readonly USER_ID = "USER_ID";
    private readonly ADMIN = "ADMIN";
    private readonly USER = "USER";

    constructor(private router: Router) { }

    // refreshToken(): Observable<any> {
    //   return this.authService.refreshToken().pipe(
    //     tap((response) => {
    //       if (response.status === 200) {
    //         this.storeJwtToken(response?.data?.accessToken!);
    //         this.storeRefreshToken(response?.data?.refreshToken!);
    //       }
    //     })
    //   );
    // }


    getJwtToken() {
        return localStorage.getItem(this.JWT_TOKEN);
    }

    getRefreshToken() {
        return localStorage.getItem(this.REFRESH_TOKEN);
    }

    getUserId() {
        const userId = localStorage.getItem(this.USER_ID);
        return userId ? parseInt(userId, 10) : null;
    }

    getAdmin() {
        const admin = localStorage.getItem(this.ADMIN);
        return admin ? JSON.parse(admin) : null;
    }
    getUser() {
        const user = localStorage.getItem(this.USER);
        return user ? JSON.parse(user) : null;
    }


    storeJwtToken(jwt: string) {
        localStorage.setItem(this.JWT_TOKEN, jwt);
    }

    storeRefreshToken(refreshToken: string) {
        localStorage.setItem(this.REFRESH_TOKEN, refreshToken);
    }

    storeUserId(userId: number) {
        localStorage.setItem(this.USER_ID, userId.toString());
    }

    storeAdmin(admin: any) {
        localStorage.setItem(this.ADMIN, JSON.stringify(admin)); // Store entire admin object
    }

    storeUser(user: any) {
        localStorage.setItem(this.USER, JSON.stringify(user)); // Store entire user object
    }

    deleteTokens() {
        // Retrieve the loginDetails item
        const savedLoginDetails = localStorage.getItem("loginDetails");
        // Clear all local storage items
        localStorage.clear();
        // Restore the loginDetails item if it exists
        if (savedLoginDetails) {
            localStorage.setItem("loginDetails", savedLoginDetails);
        }
    }

    logOut() {
        // Clear all local storage items
        this.deleteTokens();
        // Optionally, navigate the user to the login or home page
        this.router.navigate(["/login"]); // Adjust the route as necessary
    }



    getDecodedToken(): JwtPayload | null {
        const token = this.getJwtToken();
        if (!token) return null;
        try {
            return jwt_decode<JwtPayload>(token);
        } catch {
            return null;
        }
    }

    getUserRole(): JwtPayload['role'] | null {
        return this.getDecodedToken()?.role || null;
    }

    isSuperAdmin(): boolean {
        return this.getUserRole() === UserRole.SUPER_ADMIN;
    }

    isAdmin(): boolean {
        return this.getUserRole() === UserRole.ADMIN;
    }

    isUser(): boolean {
        return this.getUserRole() === UserRole.USER;
    }

}
