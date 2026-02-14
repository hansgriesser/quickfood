import { Component } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }
}
