import { Component } from '@angular/core';
import { filter, map, Observable, switchMap, take, tap } from 'rxjs';
import { OrderDto } from '../../dto/orderDTO';
import { CommonModule } from '@angular/common';
import { Restaurant } from '../../../restaurant/restaurant.model';
import { RestaurantService } from '../../../restaurant/restaurant.service';
import { OrderStatusLabel } from '../../dto/orderStatus';
import { RestaurantHeader } from '../../../restaurant/components/restaurant-header/restaurant-header';
import { ActiveOrderService } from '../../services/order-session';
import { ChatButton } from '../../../../chat/chat-button/chat-button';
import { ChatService } from '../../../../chat/services/chat-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  imports: [CommonModule, RestaurantHeader, ChatButton],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css',
})
export class Confirmation {
  
  order$ : Observable<OrderDto | null>;
  restaurant$ : Observable<Restaurant | null>;
  OrderStatusLabel = OrderStatusLabel;
  hasDiscount;
  unreadCount = 0;

  constructor(private activeOrderService: ActiveOrderService,
    private restaurantService: RestaurantService,
    private chatService: ChatService,
    private router: Router)
  {
    this.order$ = this.activeOrderService.order$;
    this.restaurant$ = this.order$.pipe(
      map(order => order?.restaurantId),
      filter((id): id is string => !!id),   // null rauswerfen
      switchMap(id =>
        this.restaurantService.getRestaurantById(id)
      )
    );
    this.hasDiscount = activeOrderService.hasDiscount;
  }

  onOpenChat(orderId: string) {
    this.chatService.openChatForOrder(orderId);
  }

  goToHome(){
    this.router.navigate(['/restaurants']);
  }
}

