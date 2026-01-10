import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RestaurantRoutingModule } from './restaurant-routing-module';
import { RestaurantDetailComponent } from './pages/restaurant-detail/restaurant-detail.component';
import { RestaurantListComponent } from './pages/restaurant-list/restaurant-list.component';

@NgModule({
  imports: [
    CommonModule,
    RestaurantRoutingModule,
    RestaurantDetailComponent,
    RestaurantListComponent
  ]
})
export class RestaurantModule { }
