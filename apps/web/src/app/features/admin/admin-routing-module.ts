import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminOverviewComponent } from './pages/overview/admin-overview.component';
import { AdminRestaurantsComponent } from './pages/restaurants/admin-restaurants.component';
import { AdminUsersComponent } from './pages/users/admin-users.component';
import { AdminZonesComponent } from './pages/zones/admin-zones.component';
import { AdminReportsComponent } from './pages/reports/admin-reports.component';
import { AdminSettingsComponent } from './pages/settings/admin-settings.component';


const routes: Routes = [
  { path: '', component: AdminOverviewComponent },
  { path: 'restaurants', component: AdminRestaurantsComponent },
  { path: 'users', component: AdminUsersComponent },
  { path: 'zones', component: AdminZonesComponent },
  { path: 'reports', component: AdminReportsComponent },
  { path: 'settings', component: AdminSettingsComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}