import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { httpInterceptorProviders } from './auth.interceptor';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { ToastrModule } from 'ngx-toastr';


@Injectable({
    providedIn: "root",
})

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            positionClass: 'toast-top-right',
            timeOut: 5000,
            closeButton: true,
            progressBar: true

        }),
        AppRoutingModule,
        AuthenticationModule,

    ],
    providers: [httpInterceptorProviders, provideAnimationsAsync()],

    bootstrap: [AppComponent],
})
export class AppModule { }
