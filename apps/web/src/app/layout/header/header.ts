import { Component, inject } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Inserted by Angular inject() migration for backwards compatibility */
  constructor(...args: unknown[]);

  constructor() {}
  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
}
