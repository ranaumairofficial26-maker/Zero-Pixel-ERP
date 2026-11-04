import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AdminProfileResponse } from '../../core/auth/auth.model';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings-page">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <div>
            <div class="breadcrumbs">
              <span>Admin Console</span>
              <span>/</span>
              <span>Settings</span>
            </div>
            <h1 class="page-title">Admin Account Settings</h1>
            <p class="page-subtitle">Manage your administrator profile information, login email, and security credentials.</p>
          </div>
        </div>

        @if (loadedProfile()) {
          <div class="account-summary-pill">
            <div class="avatar-circle">{{ getInitials(loadedProfile()!.adminName) }}</div>
            <div class="summary-meta">
              <span class="meta-name">{{ loadedProfile()!.adminName }}</span>
              <span class="meta-email">{{ loadedProfile()!.email }}</span>
            </div>
            <span class="role-badge">{{ loadedProfile()!.role || 'Admin' }}</span>
          </div>
        }
      </header>

      @if (isLoadingProfile()) {
        <div class="loading-card">
          <div class="spinner"></div>
          <p>Loading administrator profile...</p>
        </div>
      } @else {
        <div class="settings-grid">
          <!-- SECTION 1: PROFILE INFORMATION -->
          <section class="settings-card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="section-icon profile-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <div>
                  <h2 class="card-title">Profile Information</h2>
                  <p class="card-desc">Update your administrator display name and login email address.</p>
                </div>
              </div>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()" class="card-body" novalidate>
              @if (profileSuccessMessage()) {
                <div class="alert-banner alert-success" role="status">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{{ profileSuccessMessage() }}</span>
                </div>
              }

              @if (profileErrorMessage()) {
                <div class="alert-banner alert-error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{{ profileErrorMessage() }}</span>
                </div>
              }

              <!-- Admin Name -->
              <div class="form-group">
                <label for="adminName" class="form-label">
                  Admin Name <span class="required">*</span>
                </label>
                <div class="input-wrapper" [class.invalid]="isProfileFieldInvalid('adminName')">
                  <span class="input-prefix-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </span>
                  <input
                    id="adminName"
                    type="text"
                    formControlName="adminName"
                    class="form-input"
                    placeholder="Enter administrator full name"
                    autocomplete="name"
                  />
                </div>
                @if (isProfileFieldInvalid('adminName')) {
                  <div class="field-error">
                    @if (profileForm.get('adminName')?.errors?.['required']) {
                      <span>Admin Name is required.</span>
                    } @else if (profileForm.get('adminName')?.errors?.['minlength']) {
                      <span>Admin Name must be at least 2 characters.</span>
                    } @else if (profileForm.get('adminName')?.errors?.['maxlength']) {
                      <span>Admin Name cannot exceed 150 characters.</span>
                    }
                  </div>
                }
              </div>

              <!-- Email Address -->
              <div class="form-group">
                <label for="adminEmail" class="form-label">
                  Email Address <span class="required">*</span>
                </label>
                <div class="input-wrapper" [class.invalid]="isProfileFieldInvalid('email')">
                  <span class="input-prefix-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </span>
                  <input
                    id="adminEmail"
                    type="email"
                    formControlName="email"
                    class="form-input"
                    placeholder="admin@zeropixel.com"
                    autocomplete="email"
                  />
                </div>
                <span class="field-hint">This email address is used to sign in to the Zero Pixel ERP Admin Console.</span>
                @if (isProfileFieldInvalid('email')) {
                  <div class="field-error">
                    @if (profileForm.get('email')?.errors?.['required']) {
                      <span>Email Address is required.</span>
                    } @else if (profileForm.get('email')?.errors?.['email'] || profileForm.get('email')?.errors?.['pattern']) {
                      <span>Please enter a valid email address.</span>
                    }
                  </div>
                }
              </div>

              @if (loadedProfile()?.updatedAt) {
                <div class="meta-timestamp">
                  Last updated: {{ loadedProfile()!.updatedAt | date:'medium' }}
                </div>
              }

              <div class="card-actions">
                <button
                  type="submit"
                  class="btn-primary"
                  [disabled]="isSavingProfile() || profileForm.invalid"
                >
                  @if (isSavingProfile()) {
                    <span class="btn-spinner"></span>
                    <span>Saving Changes...</span>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    <span>Save Profile Changes</span>
                  }
                </button>
              </div>
            </form>
          </section>

          <!-- SECTION 2: CHANGE PASSWORD -->
          <section class="settings-card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="section-icon password-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <div>
                  <h2 class="card-title">Change Password</h2>
                  <p class="card-desc">Ensure your account uses a strong, unique password to protect ERP access.</p>
                </div>
              </div>
            </div>

            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="card-body" novalidate>
              @if (passwordSuccessMessage()) {
                <div class="alert-banner alert-success" role="status">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>{{ passwordSuccessMessage() }}</span>
                </div>
              }

              @if (passwordErrorMessage()) {
                <div class="alert-banner alert-error" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{{ passwordErrorMessage() }}</span>
                </div>
              }

              <!-- Current Password -->
              <div class="form-group">
                <label for="currentPassword" class="form-label">
                  Current Password <span class="required">*</span>
                </label>
                <div class="input-wrapper" [class.invalid]="isPasswordFieldInvalid('currentPassword')">
                  <span class="input-prefix-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </span>
                  <input
                    id="currentPassword"
                    [type]="showCurrentPassword() ? 'text' : 'password'"
                    formControlName="currentPassword"
                    class="form-input"
                    placeholder="Enter current password"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    class="visibility-toggle"
                    (click)="toggleCurrentPassword()"
                    [attr.aria-label]="showCurrentPassword() ? 'Hide current password' : 'Show current password'"
                  >
                    @if (showCurrentPassword()) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    }
                  </button>
                </div>
                @if (isPasswordFieldInvalid('currentPassword')) {
                  <div class="field-error">
                    <span>Current Password is required.</span>
                  </div>
                }
              </div>

              <!-- New Password -->
              <div class="form-group">
                <label for="newPassword" class="form-label">
                  New Password <span class="required">*</span>
                </label>
                <div class="input-wrapper" [class.invalid]="isPasswordFieldInvalid('newPassword') || passwordForm.hasError('sameAsCurrent')">
                  <span class="input-prefix-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                    </svg>
                  </span>
                  <input
                    id="newPassword"
                    [type]="showNewPassword() ? 'text' : 'password'"
                    formControlName="newPassword"
                    class="form-input"
                    placeholder="Enter strong new password"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    class="visibility-toggle"
                    (click)="toggleNewPassword()"
                    [attr.aria-label]="showNewPassword() ? 'Hide new password' : 'Show new password'"
                  >
                    @if (showNewPassword()) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    }
                  </button>
                </div>

                @if (isPasswordFieldInvalid('newPassword')) {
                  <div class="field-error">
                    @if (passwordForm.get('newPassword')?.errors?.['required']) {
                      <span>New Password is required.</span>
                    } @else if (passwordForm.get('newPassword')?.errors?.['weakPassword']) {
                      <span>{{ passwordForm.get('newPassword')?.errors?.['weakPassword'] }}</span>
                    }
                  </div>
                }
                @if (passwordForm.hasError('sameAsCurrent') && passwordForm.get('newPassword')?.dirty) {
                  <div class="field-error">
                    <span>New password cannot be the same as your current password.</span>
                  </div>
                }

                <!-- Password Policy Checklist -->
                <div class="password-policy-grid">
                  <span class="policy-item" [class.met]="hasMinLength()">
                    {{ hasMinLength() ? '✓' : '•' }} 8+ Characters
                  </span>
                  <span class="policy-item" [class.met]="hasUppercase()">
                    {{ hasUppercase() ? '✓' : '•' }} Uppercase (A-Z)
                  </span>
                  <span class="policy-item" [class.met]="hasLowercase()">
                    {{ hasLowercase() ? '✓' : '•' }} Lowercase (a-z)
                  </span>
                  <span class="policy-item" [class.met]="hasDigit()">
                    {{ hasDigit() ? '✓' : '•' }} Number (0-9)
                  </span>
                  <span class="policy-item" [class.met]="hasSpecialChar()">
                    {{ hasSpecialChar() ? '✓' : '•' }} Special Symbol (@#$!)
                  </span>
                </div>
              </div>

              <!-- Confirm New Password -->
              <div class="form-group">
                <label for="confirmNewPassword" class="form-label">
                  Confirm New Password <span class="required">*</span>
                </label>
                <div class="input-wrapper" [class.invalid]="isPasswordFieldInvalid('confirmNewPassword') || (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmNewPassword')?.touched)">
                  <span class="input-prefix-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </span>
                  <input
                    id="confirmNewPassword"
                    [type]="showConfirmPassword() ? 'text' : 'password'"
                    formControlName="confirmNewPassword"
                    class="form-input"
                    placeholder="Re-enter new password"
                    autocomplete="new-password"
                  />
                  <button
                    type="button"
                    class="visibility-toggle"
                    (click)="toggleConfirmPassword()"
                    [attr.aria-label]="showConfirmPassword() ? 'Hide confirm password' : 'Show confirm password'"
                  >
                    @if (showConfirmPassword()) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    }
                  </button>
                </div>
                @if (isPasswordFieldInvalid('confirmNewPassword')) {
                  <div class="field-error">
                    <span>Please confirm your new password.</span>
                  </div>
                } @else if (passwordForm.hasError('passwordMismatch') && (passwordForm.get('confirmNewPassword')?.dirty || passwordForm.get('confirmNewPassword')?.touched)) {
                  <div class="field-error">
                    <span>Confirm password does not match the new password.</span>
                  </div>
                }
              </div>

              <div class="card-actions">
                <button
                  type="submit"
                  class="btn-primary btn-emerald"
                  [disabled]="isSavingPassword() || passwordForm.invalid"
                >
                  @if (isSavingPassword()) {
                    <span class="btn-spinner"></span>
                    <span>Updating Password...</span>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Update Password</span>
                  }
                </button>
              </div>
            </form>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px 24px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: linear-gradient(135deg, #0284c7, #0ea5e9);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
      flex-shrink: 0;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 3px;
    }

    .page-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      font-size: 13px;
      color: #64748b;
      margin: 3px 0 0 0;
    }

    .account-summary-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 8px 14px;
    }

    .avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #0284c7;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      letter-spacing: 0.5px;
    }

    .summary-meta {
      display: flex;
      flex-direction: column;
    }

    .meta-name {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }

    .meta-email {
      font-size: 11.5px;
      color: #64748b;
    }

    .role-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
      padding: 3px 8px;
      border-radius: 999px;
      letter-spacing: 0.04em;
    }

    .loading-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 48px;
      text-align: center;
      color: #64748b;
    }

    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top-color: #0284c7;
      border-radius: 50%;
      margin: 0 auto 12px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      align-items: start;
    }

    @media (max-width: 960px) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
    }

    .settings-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03);
      overflow: hidden;
    }

    .card-header {
      padding: 18px 22px;
      border-bottom: 1px solid #f1f5f9;
      background: #fcfcfd;
    }

    .card-title-group {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .section-icon {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .profile-icon {
      background: #e0f2fe;
      color: #0284c7;
    }

    .password-icon {
      background: #dcfce7;
      color: #16a34a;
    }

    .card-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .card-desc {
      font-size: 12.5px;
      color: #64748b;
      margin: 3px 0 0 0;
    }

    .card-body {
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .alert-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }

    .alert-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
    }

    .alert-error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
    }

    .required {
      color: #ef4444;
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      transition: all 0.15s ease;
      overflow: hidden;
    }

    .input-wrapper:focus-within {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
    }

    .input-wrapper.invalid {
      border-color: #ef4444;
    }

    .input-prefix-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 12px;
      color: #94a3b8;
    }

    .form-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      padding: 10px 12px;
      font-size: 13.5px;
      color: #0f172a;
      font-weight: 500;
    }

    .form-input::placeholder {
      color: #94a3b8;
      font-weight: 400;
    }

    .visibility-toggle {
      background: transparent;
      border: none;
      color: #64748b;
      padding: 0 12px;
      height: 100%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s ease;
    }

    .visibility-toggle:hover {
      color: #0f172a;
    }

    .field-hint {
      font-size: 11.5px;
      color: #64748b;
    }

    .field-error {
      font-size: 12px;
      font-weight: 600;
      color: #dc2626;
    }

    .password-policy-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .policy-item {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      color: #64748b;
      border: 1px solid #e2e8f0;
      transition: all 0.15s ease;
    }

    .policy-item.met {
      background: #f0fdf4;
      color: #15803d;
      border-color: #86efac;
    }

    .meta-timestamp {
      font-size: 11.5px;
      color: #94a3b8;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 6px;
      border-top: 1px solid #f1f5f9;
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 10px 18px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.25);
      transition: all 0.15s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
    }

    .btn-primary.btn-emerald {
      background: linear-gradient(135deg, #10b981, #059669);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
    }

    .btn-primary.btn-emerald:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* Dark Mode Overrides */
    :host-context(.dark-mode),
    :host-context(body.dark-mode) {
      .page-header,
      .settings-card,
      .loading-card {
        background: #111827;
        border-color: #1f293d;
      }

      .card-header {
        background: #0d1424;
        border-bottom-color: #1f293d;
      }

      .page-title,
      .card-title,
      .meta-name {
        color: #f8fafc;
      }

      .page-subtitle,
      .card-desc,
      .breadcrumbs,
      .meta-email,
      .field-hint {
        color: #94a3b8;
      }

      .account-summary-pill {
        background: #172133;
        border-color: #2a374f;
      }

      .role-badge {
        background: #082f49;
        color: #38bdf8;
        border-color: #0369a1;
      }

      .profile-icon {
        background: rgba(2, 132, 199, 0.2);
        color: #38bdf8;
      }

      .password-icon {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
      }

      .form-label {
        color: #cbd5e1;
      }

      .input-wrapper {
        background: #172133;
        border-color: #2a374f;
      }

      .input-wrapper:focus-within {
        border-color: #38bdf8;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
      }

      .input-wrapper.invalid {
        border-color: #ef4444;
      }

      .form-input {
        color: #f8fafc;
      }

      .form-input::placeholder {
        color: #64748b;
      }

      .visibility-toggle {
        color: #94a3b8;
        &:hover {
          color: #f8fafc;
        }
      }

      .policy-item {
        background: #172133;
        border-color: #2a374f;
        color: #94a3b8;
      }

      .policy-item.met {
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.4);
        color: #34d399;
      }

      .alert-success {
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.35);
        color: #34d399;
      }

      .alert-error {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.35);
        color: #f87171;
      }

      .card-actions {
        border-top-color: #1f293d;
      }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  loadedProfile = signal<AdminProfileResponse | null>(null);
  isLoadingProfile = signal<boolean>(true);
  isSavingProfile = signal<boolean>(false);
  isSavingPassword = signal<boolean>(false);

  profileSuccessMessage = signal<string | null>(null);
  profileErrorMessage = signal<string | null>(null);

  passwordSuccessMessage = signal<string | null>(null);
  passwordErrorMessage = signal<string | null>(null);

  showCurrentPassword = signal<boolean>(false);
  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  profileForm: FormGroup = this.fb.group({
    adminName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/), Validators.maxLength(150)]]
  });

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, AdminSettingsComponent.strongPasswordValidator]],
      confirmNewPassword: ['', [Validators.required]]
    },
    {
      validators: [AdminSettingsComponent.passwordMatchAndReuseValidator]
    }
  );

  ngOnInit(): void {
    this.fetchAdminProfile();
  }

  fetchAdminProfile(): void {
    this.isLoadingProfile.set(true);
    this.profileErrorMessage.set(null);

    this.authService
      .getAdminProfile()
      .pipe(finalize(() => this.isLoadingProfile.set(false)))
      .subscribe({
        next: profile => {
          this.loadedProfile.set(profile);
          this.profileForm.patchValue({
            adminName: profile.adminName || profile.fullName,
            email: profile.email
          });
        },
        error: err => {
          const msg = err?.error?.detail || err?.error?.message || 'Failed to load administrator profile.';
          this.profileErrorMessage.set(msg);
          this.toastService.error(msg);
        }
      });
  }

  onSaveProfile(): void {
    this.profileForm.markAllAsTouched();
    this.profileSuccessMessage.set(null);
    this.profileErrorMessage.set(null);

    if (this.profileForm.invalid || this.isSavingProfile()) {
      return;
    }

    const adminName = (this.profileForm.value.adminName || '').trim();
    const email = (this.profileForm.value.email || '').trim().toLowerCase();

    if (!adminName || !email) {
      this.profileErrorMessage.set('Both Admin Name and Email Address are required.');
      return;
    }

    this.isSavingProfile.set(true);

    this.authService
      .updateAdminProfile({ adminName, email })
      .pipe(finalize(() => this.isSavingProfile.set(false)))
      .subscribe({
        next: updated => {
          this.loadedProfile.set(updated);
          this.profileForm.patchValue({
            adminName: updated.adminName || updated.fullName,
            email: updated.email
          });
          this.profileForm.markAsPristine();
          const msg = 'Profile information updated successfully.';
          this.profileSuccessMessage.set(msg);
          this.toastService.success(msg);
        },
        error: err => {
          const msg = err?.error?.detail || err?.error?.message || 'Unable to update profile information.';
          this.profileErrorMessage.set(msg);
          this.toastService.error(msg);
        }
      });
  }

  onChangePassword(): void {
    this.passwordForm.markAllAsTouched();
    this.passwordSuccessMessage.set(null);
    this.passwordErrorMessage.set(null);

    if (this.passwordForm.invalid || this.isSavingPassword()) {
      return;
    }

    const currentPassword = this.passwordForm.value.currentPassword || '';
    const newPassword = this.passwordForm.value.newPassword || '';
    const confirmNewPassword = this.passwordForm.value.confirmNewPassword || '';

    this.isSavingPassword.set(true);

    this.authService
      .changeAdminPassword({
        currentPassword,
        newPassword,
        confirmNewPassword
      })
      .pipe(finalize(() => this.isSavingPassword.set(false)))
      .subscribe({
        next: res => {
          this.passwordForm.reset({
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          });
          this.showCurrentPassword.set(false);
          this.showNewPassword.set(false);
          this.showConfirmPassword.set(false);

          const msg = res.message || 'Password updated successfully.';
          this.passwordSuccessMessage.set(msg);
          this.toastService.success(msg);
        },
        error: err => {
          const msg = err?.error?.detail || err?.error?.message || 'Failed to update password.';
          this.passwordErrorMessage.set(msg);
          this.toastService.error(msg);
        }
      });
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update(v => !v);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  isProfileFieldInvalid(field: string): boolean {
    const ctrl = this.profileForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  isPasswordFieldInvalid(field: string): boolean {
    const ctrl = this.passwordForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  hasMinLength(): boolean {
    const val: string = this.passwordForm.get('newPassword')?.value || '';
    return val.length >= 8;
  }

  hasUppercase(): boolean {
    const val: string = this.passwordForm.get('newPassword')?.value || '';
    return /[A-Z]/.test(val);
  }

  hasLowercase(): boolean {
    const val: string = this.passwordForm.get('newPassword')?.value || '';
    return /[a-z]/.test(val);
  }

  hasDigit(): boolean {
    const val: string = this.passwordForm.get('newPassword')?.value || '';
    return /[0-9]/.test(val);
  }

  hasSpecialChar(): boolean {
    const val: string = this.passwordForm.get('newPassword')?.value || '';
    return /[^A-Za-z0-9]/.test(val);
  }

  getInitials(name: string): string {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  static strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    if (!value) return null;

    if (value.length < 8) {
      return { weakPassword: 'New password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(value)) {
      return { weakPassword: 'New password must include at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(value)) {
      return { weakPassword: 'New password must include at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(value)) {
      return { weakPassword: 'New password must include at least one number (0-9).' };
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return { weakPassword: 'New password must include at least one special character.' };
    }
    return null;
  }

  static passwordMatchAndReuseValidator(group: AbstractControl): ValidationErrors | null {
    const currentPassword = group.get('currentPassword')?.value || '';
    const newPassword = group.get('newPassword')?.value || '';
    const confirmNewPassword = group.get('confirmNewPassword')?.value || '';

    const errors: ValidationErrors = {};

    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      errors['passwordMismatch'] = true;
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      errors['sameAsCurrent'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}

