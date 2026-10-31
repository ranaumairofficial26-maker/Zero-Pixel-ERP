import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  loginForm: FormGroup = this.fb.group({
    email: ['admin@zeropixel.com', [Validators.required, Validators.email]],
    password: ['Admin@123456', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastService.success(`Welcome back, ${res.fullName}!`, 'Login Successful');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/customers';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        const detail = err.error?.detail || err.error?.message || 'Invalid email or password. Please try again.';
        this.errorMessage.set(detail);
        this.toastService.error(detail, 'Authentication Failed');
      }
    });
  }

  fillAdminCredentials(): void {
    this.loginForm.patchValue({
      email: 'admin@zeropixel.com',
      password: 'Admin@123456'
    });
  }
}

