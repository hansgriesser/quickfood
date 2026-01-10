import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing-module';
import { AdminOverviewComponent} from './pages/overview/admin-overview.component';
import { AdminRestaurantsComponent } from './pages/restaurants/admin-restaurants.component';

@NgModule({
  imports: [CommonModule, AdminRoutingModule, AdminOverviewComponent, AdminRestaurantsComponent, AdminRestaurantsComponent],
})
export class AdminModule {}
