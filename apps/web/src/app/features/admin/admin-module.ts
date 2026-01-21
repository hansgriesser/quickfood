import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing-module';
import { AdminOverviewComponent} from './pages/overview/admin-overview.component';
import { AdminRestaurantsComponent } from './pages/restaurants/admin-restaurants.component';
import { AdminUsersComponent } from './pages/users/admin-users.component';
import { AdminZonesComponent } from './pages/zones/admin-zones.component';
import { AdminSettingsComponent } from './pages/settings/admin-settings.component';


@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    AdminOverviewComponent,
    AdminRestaurantsComponent,
    AdminUsersComponent,
    AdminZonesComponent,
    //AdminSettingsComponent,

  ],
})
export class AdminModule {}
