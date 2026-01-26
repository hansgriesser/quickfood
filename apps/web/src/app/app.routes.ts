import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';



export const routes: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch: 'full',
    },
    {
        path: 'login', canActivate: [guestGuard], loadChildren: ()=> import('./features/auth/auth-module').then((m) => m.AuthModule), data: { footer: true }
    },
    {
        path: 'register', canActivate: [guestGuard], loadComponent: ()=> import('./features/auth/pages/register/register.component').then((m) => m.RegisterComponent), data: { footer: true }
    },
    {
        path: 'restaurants', loadChildren: () => import('./features/customer/restaurant/restaurant-module').then(m => m.RestaurantModule)
    },
    {
         path: 'admin',canActivate:[adminGuard], loadChildren: () => import('./features/admin/admin-module').then(m => m.AdminModule), data: { footer: true }
    },
    {
        path: 'cart', loadChildren: () => import('./features/customer/cart/cart-module').then(m => m.CartModule)
    },
    {
        path: 'forum', loadChildren: () => import('./features/forum/forum-module').then(m => m.ForumModule)
    },
    {
        path: 'order', loadChildren: () => import('./features/customer/order/order-module').then(m => m.OrderModule )
    },
    {
        path:'**', redirectTo: 'login'
    }
];
