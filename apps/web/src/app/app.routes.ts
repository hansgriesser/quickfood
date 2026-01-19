import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';



export const routes: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch: 'full'
    },
    {
        path: 'login', canActivate: [guestGuard], loadChildren: ()=> import('./features/auth/auth-module').then((m) => m.AuthModule)
    },
    {
        path: 'restaurants', loadChildren: () => import('./features/customer/restaurant/restaurant-module').then(m => m.RestaurantModule)
    },
    {
         path: 'admin',canActivate:[adminGuard], loadChildren: () => import('./features/admin/admin-module').then(m => m.AdminModule)
    },
    {
        path: 'cart', loadChildren: () => import('./features/customer/cart/cart-module').then(m => m.CartModule)
    },
    {
        path: 'order', loadChildren: () => import('./features/customer/order/order-module').then(m => m.OrderModule )
    },
    {
        path:'**', redirectTo: 'login'
    }
];
