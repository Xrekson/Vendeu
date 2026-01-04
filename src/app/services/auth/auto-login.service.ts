import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../Store/app.store';
import { AuthService } from './auth.service';
import { logout, restoreSession } from '../Store/session.actions';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginService {
  
  constructor(
    private store: Store<AppState>,
    private authService: AuthService
  ) {}

  /**
   * Initialize authentication on app startup
   */
  initialize(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if user is already logged in via localStorage
      const isAuthenticated = this.authService.autoLogin();
      
      if (isAuthenticated) {
        const user = this.authService.getCurrentUser();
        const token = this.authService.getToken();
        
        if (user && token) {
          // Restore session from localStorage
          this.store.dispatch(restoreSession({
            session: {
              id: user.id,
              username: user.username,
              token: token,
              type: user.type,
              expiresAt: localStorage.getItem('token_expiry') 
                ? parseInt(localStorage.getItem('token_expiry')!, 10) 
                : null,
              lastLogin: Math.floor(Date.now() / 1000),
              isAuthenticated: true
            }
          }));
          
          console.log('Auto-login successful');
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Check token validity on app startup
   */
  validateTokenOnStartup(): void {
    const token = this.authService.getToken();
    
    if (token) {
      this.authService.verifyToken().subscribe({
        next: (response) => {
          if (!response.valid) {
            this.authService.clearAuthData();
            this.store.dispatch(logout());
          }
        },
        error: () => {
          this.authService.clearAuthData();
          this.store.dispatch(logout());
        }
      });
    }
  }
}