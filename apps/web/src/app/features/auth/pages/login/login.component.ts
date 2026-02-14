import { Component, inject } from '@angular/core';

import { ReactiveFormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = false;
  errorMessage: string | null = null;

  form = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  async onSubmit(): Promise<void> {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    try {
      const { username, password } = this.form.getRawValue();
      await this.auth.login({ username, password });

      const role = this.auth.getUserRole();

      switch (role) {
        case 'ADMIN':
          await this.router.navigate(['/admin']);
          break;
        case 'USER':
          await this.router.navigate(['/restaurants']);
          break;
        case 'OWNER':
          await this.router.navigate(['/owner']);
          break;
        default:
          await this.router.navigate(['/']);
      }
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.errorMessage = err?.error?.message || 'Login failed';
    } finally {
      this.isSubmitting = false;
    }
  }
}
