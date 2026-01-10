import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing-module';
import { AdminOverviewComponent} from './pages/overview/admin-overview.component';

@NgModule({
  imports: [CommonModule, AdminRoutingModule, AdminOverviewComponent],
})
export class AdminModule {}
