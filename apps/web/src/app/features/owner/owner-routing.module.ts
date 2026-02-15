import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerDashboardComponent } from './pages/dashboard/owner-dashboard.component';
import { OwnerRestaurantListComponent } from './pages/restaurant-list/owner-restaurant-list.component';
import { OwnerRestaurantDetailComponent } from './pages/restaurant-detail/owner-restaurant-detail.component';
import { OwnerOrdersComponent } from './pages/orders/owner-orders.component';
import { OwnerAnalyticsComponent } from './pages/analytics/owner-analytics.component';

const routes: Routes = [
  { path: '', component: OwnerDashboardComponent },
  { path: 'restaurants', component: OwnerRestaurantListComponent },
  { path: 'restaurants/:id', component: OwnerRestaurantDetailComponent },
  { path: 'orders', component: OwnerOrdersComponent },
  { path: 'analytics', component: OwnerAnalyticsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OwnerRoutingModule {}
