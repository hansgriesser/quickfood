import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
    FormControl
} from "@angular/forms";
import { AuthService } from "../../auth.service";
import { Router } from "@angular/router";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    isSubmitting = false;
    errorMessage: string | null = null;

    form = new FormGroup({
        username: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required]
        }),
        password: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required]
        })
    });
    
    constructor(
        private readonly auth: AuthService,
        private readonly router: Router
    ) {}

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

            await this.router.navigateByUrl('/restaurants');
        } catch (e: any) {
            this.errorMessage = e?.error?.message || 'Login failed';
        } finally {
            this.isSubmitting = false;
        }
    }
}