import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Review } from './pages/review/review';
import { Confirmation } from './pages/confirmation/confirmation';
import { Payment } from './pages/payment/payment';

const routes: Routes = [
  { path: 'review', component: Review },
  { path: 'confirmation', component: Confirmation },
  { path: 'payment', component: Payment },
  { path: '*', redirectTo: 'review' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderRoutingModule {}
