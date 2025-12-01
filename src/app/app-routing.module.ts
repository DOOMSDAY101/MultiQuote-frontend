import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full',
    },

    {
        path: 'auth',
        loadChildren: () =>
            import('./modules/authentication/authentication.module').then(m => m.AuthenticationModule)
    }
    // {
    //     path: '**',
    //     redirectTo: 'login',
    // },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule { }
