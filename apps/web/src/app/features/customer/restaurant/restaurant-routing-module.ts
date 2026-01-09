import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantListComponent } from './pages/restaurant-list/restaurant-list.component';
import { RestaurantDetailComponent } from './pages/restaurant-detail/restaurant-detail.component';

const routes: Routes = [
  { path: '', component: RestaurantListComponent},
  { path: ':id', component: RestaurantDetailComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantRoutingModule { }
