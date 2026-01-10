import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch: 'full'
    },
    {
        path: 'login', loadChildren: ()=> import('./features/auth/auth-module').then((m) => m.AuthModule)
    },
    {
        path: 'restaurants', loadChildren: () => import('./features/customer/restaurant/restaurant-module').then(m => m.RestaurantModule)
    },
    {
        path:'**', redirectTo: 'restaurants'
    }
];
