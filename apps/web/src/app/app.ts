import { Component, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { filter, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChatDrawerComponent } from './features/chat/chat/chat';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CommonModule, ChatDrawerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true
})
export class App {
  protected readonly title = signal('web');

  showFooter = false;


  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.getChild(this.activatedRoute);
        this.showFooter = route?.snapshot.data['footer'] ?? false;
      });
  }

  // Rekursiver Zugriff auf das tiefste firstChild
  private getChild(route: ActivatedRoute): ActivatedRoute | null {
    if (route.firstChild) {
      return this.getChild(route.firstChild);
    }
    return route;
  }
}
