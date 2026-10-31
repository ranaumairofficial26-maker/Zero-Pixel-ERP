import { ChangeDetectionStrategy, Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit, AfterViewInit {
  toastService = inject(ToastService);
  private router = inject(Router);

  @ViewChild('pageContainer') pageContainer?: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.scrollToTop();
      if (event?.urlAfterRedirects && !event.urlAfterRedirects.includes('/login')) {
        try {
          sessionStorage.setItem('zp_last_admin_url', event.urlAfterRedirects);
        } catch {}
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToTop();
  }

  scrollToTop(): void {
    if (this.pageContainer?.nativeElement) {
      this.pageContainer.nativeElement.scrollTop = 0;
    }
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }
}
