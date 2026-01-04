import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '', redirectTo: 'restaurants', pathMatch: 'full'
    },
    {
        path: 'restaurants', loadChildren: () => import('./features/customer/restaurant/restaurant-module').then(m => m.RestaurantModule)
    },
    {
        path:'**', redirectTo: 'restaurants'
    }
];
