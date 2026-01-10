import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminOverviewComponent } from './pages/overview/admin-overview.component';
import { AdminRestaurantsComponent } from './pages/restaurants/admin-restaurants.component';


const routes: Routes = [
  { path: '', component: AdminOverviewComponent },
  { path: 'restaurants', component: AdminRestaurantsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}