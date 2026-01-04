import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of, map, catchError, tap } from 'rxjs';
import { AppState } from '../Store/app.store';
import { 
  selectIsAuthenticated, 
  selectUserType, 
  selectIsAdmin,
  selectIsTokenExpiringSoon,
  selectTimeUntilExpiry 
} from '../Store/session.selectors';
import { logout } from '../Store/session.actions';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private store: Store<AppState>,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Main guard for route activation
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(route, state);
  }

  /**
   * Guard for child routes
   */
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuth(route, state);
  }

  /**
   * Check authentication and authorization
   */
  private checkAuth(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.store.select(selectIsAuthenticated).pipe(
      map(isAuthenticated => {
        // Check if route is protected
        const isPublicRoute = this.isPublicRoute(route);
        
        if (isPublicRoute) {
          // If user is authenticated and trying to access login/register, redirect to home
          if (isAuthenticated && this.isAuthRoute(route)) {
            this.redirectBasedOnUserType();
            return false;
          }
          return true;
        }

        // For protected routes, check authentication
        if (!isAuthenticated) {
          this.redirectToLogin(state.url);
          return false;
        }

        // Check token expiry
        const isTokenValid = this.authService.isAuthenticated();
        if (!isTokenValid) {
          this.store.dispatch(logout());
          this.redirectToLogin(state.url);
          return false;
        }

        // Check role-based access
        const requiredRoles = this.getRequiredRoles(route);
        if (requiredRoles.length > 0) {
          return this.checkUserRoles(requiredRoles);
        }

        return true;
      }),
      catchError(() => {
        // On error, redirect to login
        this.redirectToLogin(state.url);
        return of(false);
      })
    );
  }

  /**
   * Check if route is public
   */
  private isPublicRoute(route: ActivatedRouteSnapshot): boolean {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/home'];
    return publicRoutes.some(publicRoute => 
      route.routeConfig?.path === publicRoute || 
      route.routeConfig?.path === ''
    );
  }

  /**
   * Check if route is authentication-related (login/register)
   */
  private isAuthRoute(route: ActivatedRouteSnapshot): boolean {
    const authRoutes = ['login', 'register'];
    return authRoutes.includes(route.routeConfig?.path || '');
  }

  /**
   * Get required roles from route data
   */
  private getRequiredRoles(route: ActivatedRouteSnapshot): string[] {
    const roles = route.data['roles'] as string[];
    return roles || [];
  }

  /**
   * Check if user has required roles
   */
  private checkUserRoles(requiredRoles: string[]): boolean {
    let hasRequiredRole = false;
    
    // Subscribe to user type from store
    this.store.select(selectUserType).subscribe(userType => {
      hasRequiredRole = requiredRoles.includes(userType || '');
    }).unsubscribe();
    
    if (!hasRequiredRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    
    return true;
  }

  /**
   * Redirect to login with return URL
   */
  private redirectToLogin(returnUrl: string): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: returnUrl }
    });
  }

  /**
   * Redirect based on user type
   */
  private redirectBasedOnUserType(): void {
    this.store.select(selectUserType).subscribe(userType => {
      if (userType === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/dash']);
      }
    }).unsubscribe();
  }

  /**
   * Check if token is expiring soon and attempt refresh
   */
  private checkTokenExpiry(): Observable<boolean> {
    return this.store.select(selectIsTokenExpiringSoon).pipe(
      tap(isExpiringSoon => {
        if (isExpiringSoon) {
          this.store.select(selectTimeUntilExpiry).subscribe(timeLeft => {
            console.log(`Token expiring in ${timeLeft} seconds, attempting refresh...`);
            this.authService.refreshToken().subscribe({
              next: () => console.log('Token refreshed successfully'),
              error: (error:any) => {
                console.error('Token refresh failed:', error);
                this.store.dispatch(logout());
                this.router.navigate(['/login']);
              }
            });
          }).unsubscribe();
        }
      }),
      map(() => true)
    );
  }
}