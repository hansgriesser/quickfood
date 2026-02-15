import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderRoutingModule } from './order-routing-module';
import { Review } from './pages/review/review';

@NgModule({
  declarations: [],
  imports: [CommonModule, OrderRoutingModule, Review],
})
export class OrderModule {}
