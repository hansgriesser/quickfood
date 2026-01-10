import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing-module';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard.component';

@NgModule({
  imports: [CommonModule, AdminRoutingModule, AdminDashboardComponent],
})
export class AdminModule {}
