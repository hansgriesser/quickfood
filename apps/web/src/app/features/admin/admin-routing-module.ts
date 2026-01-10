import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent }, // /admin
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}