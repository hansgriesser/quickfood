import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { FullUser, User } from '../dto/user.dto';
import { AuthService } from '../../auth/auth.service';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Profile {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  baseUrl = '/api/user';

  currUserSubject: BehaviorSubject<User> = new BehaviorSubject<User>({ username: null, id: null });

  private currFullUserSubject: BehaviorSubject<FullUser | null> =
    new BehaviorSubject<FullUser | null>(null);
  readonly currFullUser$ = this.currFullUserSubject.asObservable();

  newPasswordSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  newPasswordConfirmSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');

  checkAvailabilityUsername(): Observable<boolean> {
    const username = this.currUserSubject.value.username;
    if (!username?.trim()) {
      return of(true);
    }
    return this.http.get<boolean>(`${this.baseUrl}/check-username?${username}`);
  }

  checkNewPasswordValidity(): boolean {
    return this.newPasswordSubject.value === this.newPasswordConfirmSubject.value;
  }

  updateProfile(): Observable<FullUser> {
    const updateUserDto = {
      username: this.currUserSubject.value.username ?? null,
      password: this.newPasswordSubject.value ?? null,
    };

    return this.http
      .patch<FullUser>(`${this.baseUrl}/${this.currUserSubject.value.id}`, updateUserDto)
      .pipe(
        tap((res) => {
          this.currUserSubject.next({
            ...this.currUserSubject.value,
            username: res.username,
          });
        }),
      );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadProfile(): Observable<FullUser> {
    const id = this.authService.getUserId();

    return this.http.get<FullUser>(`${this.baseUrl}/full/${id}`).pipe(
      tap((user) => {
        this.updateCurrUser();
        this.currFullUserSubject.next(user);
      }),
    );
  }

  updateCurrUser() {
    this.currUserSubject.next({
      username: this.authService.getUsername(),
      id: this.authService.getUserId(),
    });
  }
}
