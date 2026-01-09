// restaurant.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Restaurant } from './restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  private readonly mockRestaurants: Restaurant[] = [
    
    { id: '1', name: 'Café Latte', category: 'italian', rating: 4.5 },
    { id: '2', name: 'Espresso Bar', category: 'fast-food', rating: 4.2 },
    { id: '3', name: 'Kaffee König', category: 'fast-food', rating: 3.8 },
    { id: '4', name: 'Sushi Palace', category: 'asian', rating: 4.7 },
    { id: '5', name: 'Taco Fiesta', category: 'mexican', rating: 4.1 },
    { id: '6', name: 'Sushi World', category: 'Japanisch', rating: 4.8},
    { id: '7', name: 'Pasta Haus', category: 'Italienisch', rating: 4.5}
  ];

  getRestaurants(): Observable<Restaurant[]> {
    return of(this.mockRestaurants);
  }

  getRestaurantById(id: string): Observable<Restaurant | null> {
    return of(this.mockRestaurants.find(r => r.id === id) ?? null);
  }
}
