import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OwnerRoutingModule } from './owner-routing.module';
import { OwnerDashboardComponent } from './pages/dashboard/owner-dashboard.component';
import { OwnerRestaurantListComponent } from './pages/restaurant-list/owner-restaurant-list.component';
import { OwnerRestaurantDetailComponent } from './pages/restaurant-detail/owner-restaurant-detail.component';
import { OwnerOrdersComponent } from './pages/orders/owner-orders.component';
import { OwnerRestaurantFormComponent } from './components/restaurant-form/owner-restaurant-form.component';
import { OwnerAnalyticsComponent } from './pages/analytics/owner-analytics.component';

@NgModule({
  imports: [
    CommonModule,
    OwnerRoutingModule,
    OwnerDashboardComponent,
    OwnerRestaurantListComponent,
    OwnerRestaurantDetailComponent,
    OwnerOrdersComponent,
    OwnerRestaurantFormComponent,
    OwnerAnalyticsComponent,
  ],
})
export class OwnerModule {}
