import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { LayoutComponent } from './modules/layout/layout/layout.component';
import { AuthGuard } from './services/authGuard.service';
import { AdminGuard } from './services/adminGuard.service';

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
    },

    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
                canActivate: [AuthGuard],

            },
            {
                path: 'user-management',
                loadChildren: () =>
                    import('./modules/user-management/user-management.module').then(m => m.UserManagementModule),
                canActivate: [AdminGuard]
            },
        ]
    },
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
