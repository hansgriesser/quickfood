import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Checkout } from './pages/checkout/checkout';
import { Review } from './pages/review/review';
import { Confirmation } from './pages/confirmation/confirmation';
import { Payment } from './pages/payment/payment';

const routes: Routes = [
  { path: '', component: Checkout },
  { path: 'review', component: Review },
  { path: 'confirmation', component: Confirmation },
  { path: 'payment', component: Payment },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
