import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Profile } from '../services/profile';
import { FullUser } from '../dto/user.dto';
import { CommonModule } from '@angular/common';
import { debounceTime, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule],
})
export class ProfileComponent implements OnInit, OnDestroy {
  public profileService = inject(Profile);

  fullUser$: Observable<FullUser | null>;
  usernameAvailable = true;
  passwordsMatch = true;

  private destroy$ = new Subject<void>();

  constructor() {
    this.fullUser$ = this.profileService.currFullUser$;
  }

  ngOnInit(): void {
    this.profileService.loadProfile().subscribe({
      error: (err) => console.error(err),
    });

    this.profileService.currUserSubject
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => {
        this.profileService
          .checkAvailabilityUsername()
          .subscribe((available) => (this.usernameAvailable = available));
      });

    this.profileService.newPasswordSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.passwordsMatch = this.profileService.checkNewPasswordValidity();
    });

    this.profileService.newPasswordConfirmSubject.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.passwordsMatch = this.profileService.checkNewPasswordValidity();
    });
  }

  async saveChanges() {
    if (!this.profileService.checkNewPasswordValidity()) {
      alert('Passwörter stimmen nicht überein');
      return;
    }

    this.profileService.updateProfile().subscribe({
      next: () => {
        this.profileService.logout();
      },
      error: (err) => {
        console.error('Update fehlgeschlagen', err);
      },
    });
    alert('Profil erfolgreich aktualisiert. Sie werden ausgeloggt');
  }

  onUsernameChange(username: string) {
    const current = this.profileService.currUserSubject.value;
    this.profileService.currUserSubject.next({
      ...current,
      username,
    });
  }

  onNewPasswordChange(password: string) {
    this.profileService.newPasswordSubject.next(password);
  }

  onNewPasswordConfirmChange(password: string) {
    this.profileService.newPasswordConfirmSubject.next(password);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
