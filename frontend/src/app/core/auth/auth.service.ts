import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  AdminUser,
  AdminProfileResponse,
  UpdateAdminProfileRequest,
  ChangeAdminPasswordRequest,
  ChangePasswordResponse
} from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'zeropixel_admin_token';
  private readonly USER_KEY = 'zeropixel_admin_user';

  currentUser = signal<AdminUser | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());

  private get baseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5282/api';
    }
    return environment.apiUrl || 'http://localhost:5282/api';
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(res => {
        this.setSession(res);
      })
    );
  }

  getAdminProfile(): Observable<AdminProfileResponse> {
    return this.http.get<AdminProfileResponse>(`${this.baseUrl}/admin/settings/profile`).pipe(
      tap(profile => {
        this.syncUserFromProfile(profile);
      })
    );
  }

  updateAdminProfile(payload: UpdateAdminProfileRequest): Observable<AdminProfileResponse> {
    return this.http.put<AdminProfileResponse>(`${this.baseUrl}/admin/settings/profile`, payload).pipe(
      tap(profile => {
        this.syncUserFromProfile(profile);
      })
    );
  }

  changeAdminPassword(payload: ChangeAdminPasswordRequest): Observable<ChangePasswordResponse> {
    return this.http.post<ChangePasswordResponse>(`${this.baseUrl}/admin/settings/change-password`, payload).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          this.token.set(res.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  getToken(): string | null {
    return this.token() || this.getStoredToken();
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    const user: AdminUser = {
      email: authResult.email,
      fullName: authResult.fullName,
      role: authResult.role
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.token.set(authResult.token);
    this.currentUser.set(user);
  }

  private syncUserFromProfile(profile: AdminProfileResponse): void {
    if (profile.token) {
      localStorage.setItem(this.TOKEN_KEY, profile.token);
      this.token.set(profile.token);
    }
    const updatedUser: AdminUser = {
      email: profile.email,
      fullName: profile.adminName || profile.fullName,
      role: profile.role || 'Admin'
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
    this.currentUser.set(updatedUser);
  }

  private getStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): AdminUser | null {
    if (typeof localStorage === 'undefined') return null;
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    try {
      const user = JSON.parse(userJson);
      if (user && (user.fullName === 'Zero Pixel Admin' || !user.fullName)) {
        user.fullName = 'Naveed Ahmad';
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }
      return user;
    } catch {
      return null;
    }
  }
}
