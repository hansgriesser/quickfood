import { Component } from '@angular/core';
import { OrderService } from '../../services/order';
import { filter, map, Observable, switchMap } from 'rxjs';
import { OrderDto } from '../../orderDTO';
import { CommonModule } from '@angular/common';
import { Restaurant } from '../../../restaurant/restaurant.model';
import { RestaurantService } from '../../../restaurant/restaurant.service';
import { OrderStatusLabel } from '../../orderDTO';
import { RestaurantHeader } from '../../../restaurant/components/restaurant-header/restaurant-header';

@Component({
  selector: 'app-confirmation',
  imports: [CommonModule, RestaurantHeader],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css',
})
export class Confirmation {
  
  order$ : Observable<OrderDto | null>;
  restaurant$ : Observable<Restaurant | null>;
  OrderStatusLabel = OrderStatusLabel;

  constructor(private orderService: OrderService, private restaurantService: RestaurantService){
    this.order$ = this.orderService.order$;
    this.restaurant$ = this.order$.pipe(
      map(order => order?.restaurantId),
      filter((id): id is string => !!id),   // null rauswerfen
      switchMap(id =>
        this.restaurantService.getRestaurantById(id)
      )
    );

  }

  ngOnInit(){
    this.orderService.startPolling();
  }
  
  ngOnDestroy() {
    this.orderService.stopPolling();
  }
}
