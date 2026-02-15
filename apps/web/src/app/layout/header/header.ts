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

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
