import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, AdminUser } from './auth.model';

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

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        this.setSession(res);
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

