import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'zerp_theme_mode';
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    const nextMode = !this.isDarkMode();
    this.isDarkMode.set(nextMode);
    this.applyTheme(nextMode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, nextMode ? 'dark' : 'light');
    }
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document === 'undefined') return;

    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}

