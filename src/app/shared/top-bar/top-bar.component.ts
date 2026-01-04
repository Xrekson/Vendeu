import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';

// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { AuthService } from '../../services/auth/auth.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../services/Store/app.store';
import { 
  selectIsAuthenticated, 
  selectUsername, 
  selectUserType,
  selectIsAdmin,
  selectUserId 
} from '../../services/Store/session.selectors';
import { logout } from '../../services/Store/session.actions';
import { MatChipsModule } from '@angular/material/chips';

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // Angular Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  // Observables from store
  isAuthenticated$: Observable<boolean>;
  username$: Observable<string | null>;
  userType$: Observable<string | null>;
  isAdmin$: Observable<boolean>;
  userId$: Observable<string | null>;
  
  // Combined user profile
  userProfile: UserProfile | null = null;
  currentRoute: string = '';
  
  // UI state
  notificationCount = 0;
  isLoading = false;
  isMenuOpen = false;
  
  // Mock notifications (replace with real service)
  notifications = [
    { id: 1, message: 'Your bid on "Vintage Watch" was outbid', time: '2 min ago', read: false, type: 'bid' },
    { id: 2, message: 'Auction "Antique Chair" is ending in 30 minutes', time: '15 min ago', read: false, type: 'reminder' },
    { id: 3, message: 'You won "Rare Coin Collection"!', time: '1 hour ago', read: true, type: 'winner' }
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize observables
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.username$ = this.store.select(selectUsername);
    this.userType$ = this.store.select(selectUserType);
    this.isAdmin$ = this.store.select(selectIsAdmin);
    this.userId$ = this.store.select(selectUserId);
  }

  ngOnInit(): void {
    // Subscribe to route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects || event.url;
        this.cdr.detectChanges(); // Trigger change detection
      });

    // Subscribe to authentication state and user data
    combineLatest([
      this.isAuthenticated$,
      this.username$,
      this.userType$,
      this.userId$
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([isAuthenticated, username, userType, userId]) => {
        if (isAuthenticated && username && userId) {
          // Get user data from AuthService
          const storedUser = this.authService.getCurrentUser();
          
          this.userProfile = {
            id: userId,
            username: username,
            email: storedUser?.email || '',
            firstName: storedUser?.firstName || '',
            lastName: storedUser?.lastName || '',
            role: userType || 'user',
            avatar: storedUser?.avatar || this.generateAvatar(username)
          };
          
          // Update notification count
          this.updateNotificationCount();
        } else {
          this.userProfile = null;
          this.notificationCount = 0;
        }
      });

    // Check for notifications periodically (every 30 seconds)
    this.setupNotificationPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private generateAvatar(username: string): string {
    // Generate consistent avatar based on username
    const hash = Array.from(username).reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const hue = Math.abs(hash % 360);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=hsl(${hue},70%,50%)&color=fff&bold=true`;
  }

  private updateNotificationCount(): void {
    if (this.userProfile) {
      // Count unread notifications
      this.notificationCount = this.notifications.filter(n => !n.read).length;
      
      // In real app, fetch from notification service
      // this.notificationService.getUnreadCount().subscribe(count => {
      //   this.notificationCount = count;
      // });
    }
  }

  private setupNotificationPolling(): void {
    // Poll for new notifications every 30 seconds
    const interval$ = new Observable<number>(subscriber => {
      let count = 0;
      const intervalId = setInterval(() => {
        subscriber.next(count++);
      }, 30000); // 30 seconds
      
      return () => clearInterval(intervalId);
    });

    interval$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.userProfile) {
          this.updateNotificationCount();
        }
      });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  onLogout(): void {
    this.isLoading = true;
    
    this.authService.logout().subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Logged out successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.isLoading = false;
        this.snackBar.open('Logout failed. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        // Force logout on client side even if API fails
        this.store.dispatch(logout());
        this.router.navigate(['/login']);
      }
    });
  }

  getHomeLink(): string {
    if (this.userProfile) {
      return this.userProfile.role === 'admin' ? '/admin' : '/dash';
    }
    return '/';
  }

  getDisplayName(): string {
    if (!this.userProfile) return '';
    
    if (this.userProfile.firstName && this.userProfile.lastName) {
      return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    }
    
    return this.userProfile.username;
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  getNotificationText(): string {
    return this.notificationCount > 0 
      ? `${this.notificationCount} new notification${this.notificationCount > 1 ? 's' : ''}`
      : 'No notifications';
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach(notification => notification.read = true);
    this.notificationCount = 0;
    
    // In real app, call notification service
    // this.notificationService.markAllAsRead().subscribe();
    
    this.snackBar.open('All notifications marked as read', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  clearNotification(notificationId: number): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateNotificationCount();
    
    // In real app, call notification service
    // this.notificationService.clear(notificationId).subscribe();
  }

  hasRole(role: string): boolean {
    return this.userProfile?.role === role || false;
  }

  isTokenValid(): boolean {
    return this.authService.isAuthenticated();
  }

  refreshToken(): void {
    this.authService.refreshToken().subscribe({
      next: () => {
        this.snackBar.open('Token refreshed', 'Close', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Token refresh failed:', error);
        this.snackBar.open('Token refresh failed', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  openProfile(): void {
    this.router.navigate(['/profile']);
  }

  openSettings(): void {
    this.router.navigate(['/settings']);
  }

  openWatchlist(): void {
    this.router.navigate(['/watchlist']);
  }

  openMyBids(): void {
    this.router.navigate(['/my-bids']);
  }

  openMyAuctions(): void {
    this.router.navigate(['/my-auctions']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  getUnreadNotifications(): any[] {
    return this.notifications.filter(n => !n.read);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'bid': return 'gavel';
      case 'reminder': return 'schedule';
      case 'winner': return 'emoji_events';
      default: return 'notifications';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'bid': return 'primary';
      case 'reminder': return 'accent';
      case 'winner': return 'warn';
      default: return '';
    }
  }
}