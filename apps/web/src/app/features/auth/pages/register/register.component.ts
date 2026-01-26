import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { RegisterRole } from '../../auth-model';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  isSubmitting = false;
  errorMessage: string | null = null;

  roles: { label: string; value: RegisterRole }[] = [
    { label: 'Customer', value: 'USER' },
    { label: 'Restaurant Owner', value: 'OWNER' },
  ];

  form = new FormGroup({
    username: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    role: new FormControl<RegisterRole>('USER', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  async onSubmit(): Promise<void> {
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      const { username, password, role } = this.form.getRawValue();
      await this.auth.register({ username, password, role });

      // Nach Register hast du schon Token -> einfach weiterleiten
      await this.router.navigate(['/restaurants']);
    } catch (e: any) {
      this.errorMessage = e?.error?.message || 'Registration failed';
    } finally {
      this.isSubmitting = false;
    }
  }
}